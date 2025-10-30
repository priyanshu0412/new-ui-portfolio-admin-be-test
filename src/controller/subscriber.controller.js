const SibApiV3Sdk = require("sib-api-v3-sdk");
const Subscriber = require("../models/subscriber.model");

const subscribeUser = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email required" });

        let subscriber = await Subscriber.findOne({ email });
        if (subscriber) {
            subscriber.subscribed = true;
            await subscriber.save();
            return res.status(200).json({
                success: true,
                message: "You’re already subscribed!",
            });
        }

        await Subscriber.create({ email });
        res.status(201).json({
            success: true,
            message: "Subscribed successfully!",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


const unsubscribeUser = async (req, res) => {
    try {
        const { email } = req.body;

        const subscriber = await Subscriber.findOne({ email });
        if (!subscriber) return res.status(404).json({ error: "Not found" });

        subscriber.subscribed = false;
        await subscriber.save();

        res.status(200).json({ message: "Unsubscribed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};


const sendNewsletter = async (req, res) => {
    try {
        const { subject, content, recipients = [], sendToAll = false } = req.body;

        if (!subject || !content)
            return res.status(400).json({ error: "Subject & content required" });

        let sendTo = [];

        if (sendToAll) {
            const activeSubscribers = await Subscriber.find({ subscribed: true });
            sendTo = activeSubscribers.map((s) => s.email);
        } else if (recipients.length > 0) {
            const validSubscribers = await Subscriber.find({
                email: { $in: recipients },
                subscribed: true,
            });
            sendTo = validSubscribers.map((s) => s.email);
            const extraEmails = recipients.filter(
                (r) => !validSubscribers.some((v) => v.email === r)
            );
            if (extraEmails.length > 0) sendTo.push(...extraEmails);
        }

        if (sendTo.length === 0)
            return res.status(400).json({ error: "No valid recipients to send" });

        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications["api-key"];
        apiKey.apiKey = process.env.BREVO_API_KEY;
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        await Promise.all(
            sendTo.map(async (email) => {
                const sendSmtpEmail = {
                    to: [{ email }],
                    sender: { name: "Your Portfolio", email: "info@priyanshudev.site" },
                    subject,
                    htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #fafafa;">
              <h2 style="color:#0D6EFD;">${subject}</h2>
              <div style="margin-top: 10px;">${content}</div>
              <hr/>
              <p style="font-size: 12px; color: #888;">
                You are receiving this because you subscribed to updates.<br/>
                <a href="${process.env.FRONTEND_URL_FOR_UNSUB}/unsubscribe?email=${email}">
                  Unsubscribe
                </a>
              </p>
            </div>
          `,
                };

                await apiInstance.sendTransacEmail(sendSmtpEmail);
            })
        );

        res.status(200).json({
            message: `Newsletter sent successfully to ${sendTo.length} recipient(s)!`,
        });
    } catch (err) {
        console.error("Brevo Newsletter Error:", err);
        res.status(500).json({ error: "Failed to send newsletter" });
    }
};


const getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ createdAt: -1 });
        res.status(200).json(subscribers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch subscribers" });
    }
};


module.exports = {
    subscribeUser,
    unsubscribeUser,
    sendNewsletter,
    getAllSubscribers
}