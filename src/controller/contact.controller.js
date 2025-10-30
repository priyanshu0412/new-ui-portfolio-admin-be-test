const SibApiV3Sdk = require("sib-api-v3-sdk");

const contactUser = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa; padding: 30px;">
        <div style="max-width: 600px; background: #ffffff; margin: auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: #0d6efd; color: #ffffff; padding: 20px 30px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">New Message from Your Portfolio</h2>
          </div>
          <div style="padding: 25px 30px; color: #333333;">
            <p style="font-size: 16px;">Hello, you have received a new message via your portfolio contact form.</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr><td style="padding: 8px 0; font-weight: 600;">Name:</td><td>${name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: 600;">Email:</td><td>${email}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: 600;">Subject:</td><td>${subject}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: 600; vertical-align: top;">Message:</td><td>${message}</td></tr>
            </table>
          </div>
          <div style="background: #f0f4f8; padding: 15px 30px; text-align: center; font-size: 13px; color: #777;">
            <p style="margin: 0;">This email was automatically sent from your portfolio website.</p>
          </div>
        </div>
      </div>
    `;

    const sendSmtpEmail = {
      to: [{ email: process.env.MY_EMAIL_CONTACT }],
      sender: { name: "Portfolio Contact", email: "contact@priyanshudev.site" },
      replyTo: { email },
      subject: `New Contact Form Message: ${subject}`,
      htmlContent,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully:", response);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Brevo Mail Error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
};

module.exports = contactUser;
