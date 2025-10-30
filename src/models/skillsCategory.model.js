const mongoose = require("mongoose");

const skillCategorySchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        skills: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Skill",
            },
        ],
    },
    { timestamps: true },
);

const SkillCategory = mongoose.model("SkillCategory", skillCategorySchema);

module.exports = SkillCategory;
