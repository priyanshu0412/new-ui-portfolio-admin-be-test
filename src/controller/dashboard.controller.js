const Blog = require("../models/blog.model");
const Project = require("../models/projects.model");
const Skill = require("../models/skills.model");
const Subscriber = require("../models/subscriber.model");

const countBlog = async (req, res) => {
    try {
        const totalBlogs = await Blog.countDocuments();

        return res.status(200).json({
            success: true,
            count: totalBlogs,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch blog count",
            error: error.message,
        });
    }
};

const countProject = async (req, res) => {
    try {
        const totalProjects = await Project.countDocuments();

        return res.status(200).json({
            success: true,
            count: totalProjects,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch project count",
            error: error.message,
        });
    }
};

const countSubscriber = async (req, res) => {
    try {
        const totalSubscribers = await Subscriber.countDocuments({
            subscribed: true,
        });

        return res.status(200).json({
            success: true,
            count: totalSubscribers,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch subscriber count",
            error: error.message,
        });
    }
};

const countSkills = async (req, res) => {
    try {
        const totalSkills = await Skill.countDocuments();

        return res.status(200).json({
            success: true,
            count: totalSkills,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch skills count",
            error: error.message,
        });
    }
};


module.exports = {
    countBlog,
    countProject,
    countSubscriber,
    countSkills
}