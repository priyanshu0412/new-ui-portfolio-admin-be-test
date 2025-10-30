const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth.middleware")
const
    {
        createFooterContent,
        getAllFooterContent,
        getSpecificFooterContent,
        deleteFooterContent,
        updateFooterContent
    } = require("../controller/footerContent.controller")

router.post("/", authMiddleware, createFooterContent)
router.get("/", getAllFooterContent)
router.get("/:id", getSpecificFooterContent)
router.patch("/:id", authMiddleware, updateFooterContent)
router.delete("/:id", authMiddleware, deleteFooterContent)

module.exports = router 