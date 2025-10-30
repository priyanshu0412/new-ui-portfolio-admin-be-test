const express = require("express")
const router = express.Router()
const contactUser = require("../controller/contact.controller")

router.post("/", contactUser)

module.exports = router

