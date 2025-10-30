const FooterContent = require("../models/footerContent.model");

const createFooterContent = async (req, res) => {
    try {
        const {
            email,
            phone,
            content,
            location,
            followMeLinks,
            socialLinks,
            services
        } = req.body;

        // 🔹 Basic validation
        if (!email || !phone || !content || !location) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields: email, phone, content, location."
            });
        }

        // 🔹 Create new entry
        const newFooter = await FooterContent.create({
            email,
            phone,
            content,
            location,
            followMeLinks,
            socialLinks,
            services
        });

        return res.status(201).json({
            success: true,
            message: "Footer content created successfully.",
            data: newFooter
        });

    } catch (error) {
        console.error("Error creating footer content:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
};

const getAllFooterContent = async (req, res) => {
    try {
        const allFooters = await FooterContent.find();

        if (!allFooters || allFooters.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No footer content found."
            });
        }

        return res.status(200).json({
            success: true,
            count: allFooters.length,
            data: allFooters
        });

    } catch (error) {
        console.error("Error fetching footer content:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
};

const getSpecificFooterContent = async (req, res) => {
    try {
        const { id } = req.params;

        const footer = await FooterContent.findById(id);

        if (!footer) {
            return res.status(404).json({
                success: false,
                message: "Footer content not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: footer
        });

    } catch (error) {
        console.error("Error fetching specific footer content:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
};

const updateFooterContent = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedFooter = await FooterContent.findByIdAndUpdate(
            id,
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        if (!updatedFooter) {
            return res.status(404).json({
                success: false,
                message: "Footer content not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Footer content updated successfully.",
            data: updatedFooter
        });
    } catch (error) {
        console.error("Error updating footer content:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
};

const deleteFooterContent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFooter = await FooterContent.findByIdAndDelete(id);

        if (!deletedFooter) {
            return res.status(404).json({
                success: false,
                message: "Footer content not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Footer content deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting footer content:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
};

module.exports = {
    createFooterContent,
    getAllFooterContent,
    getSpecificFooterContent,
    updateFooterContent,
    deleteFooterContent
}