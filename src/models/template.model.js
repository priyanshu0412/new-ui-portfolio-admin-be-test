const mongoose = require("mongoose");

// -------------------- Template Schema --------------------

const templateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        liveUrl: {
            type: String,
            required: true,
        },
        githubUrl: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TemplateCategory",
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const Template = mongoose.model("Template", templateSchema);

module.exports = Template;
