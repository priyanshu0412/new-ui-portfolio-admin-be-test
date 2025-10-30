const nodemailer = require("nodemailer");

// --------------------------------------

const contactUser = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST_CONFIG,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER_CONTACT,
        pass: process.env.EMAIL_PASS_CONTACT,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error("SMTP Verify Error", error);
      } else {
        console.log("Zoho SMTP Server is ready to send emails!");
      }
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER_CONTACT}>`,
      replyTo: email,
      to: process.env.MY_EMAIL_CONTACT,
      subject: `New Contact Form Message: ${subject}`,
      html: `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa; padding: 30px;">
    <div style="max-width: 600px; background: #ffffff; margin: auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <div style="background: #0d6efd; color: #ffffff; padding: 20px 30px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">New Message from Your Portfolio</h2>
      </div>
      <div style="padding: 25px 30px; color: #333333;">
        <p style="font-size: 16px;">Hello, you have received a new message via your portfolio contact form.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 8px 0; font-weight: 600; width: 120px;">Name:</td>
            <td style="padding: 8px 0;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600;">Email:</td>
            <td style="padding: 8px 0;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600;">Subject:</td>
            <td style="padding: 8px 0;">${subject}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; vertical-align: top;">Message:</td>
            <td style="padding: 8px 0;">${message}</td>
          </tr>
        </table>
      </div>
      <div style="background: #f0f4f8; padding: 15px 30px; text-align: center; font-size: 13px; color: #777;">
        <p style="margin: 0;">This email was automatically sent from your portfolio website.</p>
      </div>
    </div>
  </div>
  `,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Mail error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
};

module.exports = contactUser;
