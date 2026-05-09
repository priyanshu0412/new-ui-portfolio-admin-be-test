const mongoose = require("mongoose");

// -------------------- Template Category Schema --------------------

const templateCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

const TemplateCategory = mongoose.model("TemplateCategory", templateCategorySchema);

module.exports = TemplateCategory;
