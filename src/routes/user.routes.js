const express = require("express")
const route = express.Router()
const {
    loginUser,
    verifyToken
} = require("../controller/user.controller")


route.post("/login", loginUser)
route.post("/verify-token", verifyToken)


module.exports = route