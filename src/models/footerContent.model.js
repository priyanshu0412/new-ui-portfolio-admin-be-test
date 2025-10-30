const mongoose = require("mongoose")

const footerContentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    followMeLinks: [
        {
            icon: {
                type: String,
            },
            url: {
                type: String,
            }
        }
    ],
    socialLinks: [
        {
            icon: {
                type: String,
            },
            url: {
                type: String,
            }
        }
    ],
    services: [
        {
            type: String,
            required: true
        }
    ]
})

const FooterContent = mongoose.model("FooterContent", footerContentSchema)

module.exports = FooterContent
