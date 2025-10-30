const mongoose = require("mongoose");
const User = require("./models/user.model");

// ----------------------------------------

const DBConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB Connected Successfully");

        // ------------------ Seed user ------------------
        const existingUser = await User.findOne({ email: process.env.DBSEEDUSERID });
        if (!existingUser) {
            const user = new User({
                email: process.env.DBSEEDUSERID,
                password: process.env.DBSEEDUSERPASS,
            });
            await user.save();
        } else {
            console.log("Default user already exists");
        }

    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

module.exports = DBConnect;
