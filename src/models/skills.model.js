const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
            required: true,
        },
        icon: {
            type: String,
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SkillCategory",
            required: true,
        },
    },
    { timestamps: true },
);

const Skill = mongoose.model("Skill", skillSchema);

module.exports = Skill;
