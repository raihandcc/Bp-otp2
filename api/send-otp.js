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
    const { phone, method } = req.body || {};

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: phone,
        channel: method === "call" ? "call" : "sms"
      });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to send OTP",
      details: error.message
    });
  }
};
