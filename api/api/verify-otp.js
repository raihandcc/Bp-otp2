const twilio = require("twilio");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST request only" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { phone, code } = body;

    if (!phone || !code) {
      return res.status(400).json({
        error: "Phone and code are required",
        receivedBody: body
      });
    }

    const digits = phone.replace(/\D/g, "").slice(-10);
    const formattedPhone = "+1" + digits;

    if (digits.length !== 10) {
      return res.status(400).json({
        error: "Invalid phone number",
        receivedPhone: phone,
        formattedPhone
      });
    }

    const cleanCode = String(code).replace(/\D/g, "").slice(0, 6);

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const result = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: formattedPhone,
        code: cleanCode
      });

    if (result.status === "approved") {
      return res.status(200).json({
        verified: true,
        status: result.status
      });
    }

    return res.status(400).json({
      verified: false,
      status: result.status,
      to: formattedPhone
    });
  } catch (error) {
    return res.status(500).json({
      error: "Verification failed",
      details: error.message
    });
  }
};
