const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    subscribed: {
        type: Boolean,
        default: true
    },
    addedManually: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

module.exports = Subscriber
