const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
    {
        designation: {
            type: String,
            required: true,
        },
        company: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            required: true,
        },
        startYear: {
            type: String,
            required: true,
        },
        endYear: {
            type: String,
            required: false,
        },
        keyAchievement: {
            type: [String],
            default: [],
            required: true
        },
        learn: {
            type: [String],
            default: [],
            required: true
        },
    },
    {
        timestamps: true,
    }
);


const Experience = mongoose.model("Experience", experienceSchema);

module.exports = Experience;
