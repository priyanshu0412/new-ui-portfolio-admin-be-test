const Project = require("../models/projects.model");


// -------------------------- CREATE PROJECT --------------------------
const crateProject = async (req, res) => {
    try {
        let {
            title,
            desc,
            techUsed,
            category,
            tags,
            githubLink,
            livePreviewLink,
            keyFeatures,
            isFeatured,
            client,
            completeDate,
            moreRelatedProjects,
            technicalChallengesAndSolutions,
            aboutProjectContent,
        } = req.body;

        // Parse arrays that are sent as JSON strings
        techUsed = techUsed ? JSON.parse(techUsed) : [];
        tags = tags ? JSON.parse(tags) : [];
        keyFeatures = keyFeatures ? JSON.parse(keyFeatures) : [];
        moreRelatedProjects = moreRelatedProjects ? JSON.parse(moreRelatedProjects) : [];

        // THIS IS THE IMPORTANT FIX:
        if (technicalChallengesAndSolutions && typeof technicalChallengesAndSolutions === 'string') {
            technicalChallengesAndSolutions = JSON.parse(technicalChallengesAndSolutions);
        }

        completeDate = completeDate ? new Date(completeDate) : null;

        // You can handle thumbnailImg from req.file as usual
        const thumbnailImg = req.file?.path || "";

        const project = new Project({
            title,
            desc,
            techUsed,
            category,
            tags,
            githubLink,
            livePreviewLink,
            thumbnailImg,
            keyFeatures,
            isFeatured: isFeatured || false,
            client,
            completeDate,
            moreRelatedProjects,
            technicalChallengesAndSolutions: technicalChallengesAndSolutions || [],
            aboutProjectContent,
        });

        await project.save();

        res.status(201).json({ success: true, message: "Project created successfully", project });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ success: false, message: "Failed to create project", error: error.message });
    }
};


// -------------------------- GET ALL PROJECT --------------------------
const getAllProject = async (req, res) => {
    try {
        const { category, page = 1, limit = 10, sortBy = "completeDate", sortOrder = "desc", featured } = req.query;

        // Build filter object
        const filter = {};
        if (category) {
            filter.category = category;
        }
        if (featured === "true") {
            filter.isFeatured = true;
        } else if (featured === "false") {
            filter.isFeatured = false;
        }

        // Build sort object
        // Prioritize sorting by isFeatured if needed (put featured first)
        // But if sorting explicitly by completeDate, then use that
        let sort = {};
        if (sortBy === "featured") {
            // Sort featured projects first (descending true > false) then by date
            sort = { isFeatured: -1, completeDate: sortOrder === "asc" ? 1 : -1 };
        } else if (sortBy === "date") {
            sort["completeDate"] = sortOrder === "asc" ? 1 : -1;
        } else {
            // Default fallback sort by creation date
            sort = { createdAt: -1 };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const projects = await Project.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Total count for pagination
        const totalCount = await Project.countDocuments(filter);

        res.json({
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            projects,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};


// -------------------------- GET SPECIFIC PROJECT --------------------------
const getSpecificProject = async (req, res) => {
    try {
        const projectId = req.params.id;

        const project = await Project.findById(projectId)

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.json(project);
    } catch (err) {
        console.error(err);
        if (err.kind === "ObjectId") {
            return res.status(400).json({ error: "Invalid project ID" });
        }
        res.status(500).json({ error: "Server error" });
    }
}


// -------------------------- DELETE PROJECT --------------------------
const deleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;

        const deletedProject = await Project.findByIdAndDelete(projectId);

        if (!deletedProject) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.json({ message: "Project deleted successfully", deletedProject });
    } catch (err) {
        console.error(err);
        if (err.kind === "ObjectId") {
            return res.status(400).json({ error: "Invalid project ID" });
        }
        res.status(500).json({ error: "Server error" });
    }
}


// -------------------------- Helper function to parse field if stringified JSON --------------------------
const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field; // already an array
    if (typeof field === "string") {
        try {
            return JSON.parse(field);
        } catch (err) {
            // Fallback: maybe the client sent plain comma separated string?
            return field.split(",").map(s => s.trim());
        }
    }
    return [];
};


// -------------------------- UPDATE PROJECT --------------------------
const updateProject = async (req, res) => {
    try {
        const projectId = req.params.id;

        const {
            title,
            desc,
            techUsed,
            category,
            tags,
            githubLink,
            livePreviewLink,
            keyFeatures,
            isFeatured,
            client,
            completeDate,
            technicalChallengesAndSolutions,
            aboutProjectContent,
        } = req.body;

        // Parse array fields properly
        const techArray = parseArrayField(techUsed);
        const tagsArray = parseArrayField(tags);
        const keyFeaturesArray = parseArrayField(keyFeatures);

        // Parse technicalChallengesAndSolutions JSON string or use as is
        let parsedTechChallenges = [];
        if (technicalChallengesAndSolutions) {
            if (typeof technicalChallengesAndSolutions === "string") {
                try {
                    parsedTechChallenges = JSON.parse(technicalChallengesAndSolutions);
                } catch (e) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid JSON for technicalChallengesAndSolutions",
                    });
                }
            } else if (Array.isArray(technicalChallengesAndSolutions)) {
                parsedTechChallenges = technicalChallengesAndSolutions;
            }
        }

        const thumbnailImg = req.file?.path;

        const updateData = {
            title,
            desc,
            techUsed: techArray,
            category,
            tags: tagsArray,
            githubLink,
            livePreviewLink,
            keyFeatures: keyFeaturesArray,
            isFeatured: isFeatured ?? false,
            client,
            completeDate,
            technicalChallengesAndSolutions: parsedTechChallenges,
            aboutProjectContent,
        };

        if (thumbnailImg) {
            updateData.thumbnailImg = thumbnailImg;
        }

        const updatedProject = await Project.findByIdAndUpdate(projectId, updateData, {
            new: true,
        });

        if (!updatedProject) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        res.json({
            success: true,
            message: "Project updated successfully",
            project: updatedProject,
        });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update project",
            error: error.message,
        });
    }
};


module.exports = {
    crateProject,
    getAllProject,
    getSpecificProject,
    deleteProject,
    updateProject
};
