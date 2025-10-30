const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        desc: {
            type: String,
            required: true,
        },
        techUsed: [
            {
                type: String,
                trim: true,
            },
        ],
        category: {
            type: String,
            enum: ["Fullstack", "Frontend", "Backend"],
            required: true,
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        githubLink: {
            type: String,
            trim: true,
        },
        livePreviewLink: {
            type: String,
            trim: true,
        },
        thumbnailImg: {
            type: String,
            trim: true,
        },
        keyFeatures: [
            {
                type: String,
            },
        ],
        isFeatured: {
            type: Boolean,
            default: false,
        },
        client: {
            type: String,
            trim: true,
        },
        completeDate: {
            type: Date,
        },
        technicalChallengesAndSolutions: [
            {
                question: { type: String, required: true },
                answer: { type: String, required: true },
            },
        ],
        aboutProjectContent: {
            type: String,
        },
    },
    { timestamps: true },
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
