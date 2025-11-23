require("dotenv").config()
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const morgan = require("morgan")
const cors = require("cors")
const DBConnect = require("./db")
const userRoutes = require("./routes/user.routes")
const expRoutes = require("./routes/exp.routes")
const skillsRoutes = require("./routes/skill.routes")
const blogCategoryRoutes = require("./routes/blogCategory.routes")
const blogRoutes = require("./routes/blog.routes")
const projectRoutes = require("./routes/project.routes")
const footerContentRoutes = require("./routes/footerContent.routes")
const contactRoutes = require("./routes/contact.routes")
const subscribeRoutes = require("./routes/subscriber.routes")
const resumeRoutes = require("./routes/resume.routes")

// --------------------- Body Parsing & Logs & CORS ---------------------
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(morgan("dev"))
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTION"]
}))


// --------------------- Connect DB ---------------------
DBConnect();


// --------------------- Routes ---------------------

// User Routes 
app.use("/api/v1/user", userRoutes)

// Experience Routes
app.use("/api/v1/exp", expRoutes)

// Skill Routes 
app.use("/api/v1/skills", skillsRoutes)

// Blog Category 
app.use("/api/v1/blogCategory", blogCategoryRoutes)

// Blog 
app.use("/api/v1/blog", blogRoutes)

// Project 
app.use("/api/v1/project", projectRoutes)

// Footer Content 
app.use("/api/v1/footerContent", footerContentRoutes)

// Contact Form 
app.use("/api/v1/contact", contactRoutes)

// Subscribe 
app.use("/api/v1/subscribe", subscribeRoutes)

// Resume 
app.use("/api/v1/resume", resumeRoutes)

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});


// --------------------- Listing Port ---------------------
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server Started on localhost:${PORT}`)
})