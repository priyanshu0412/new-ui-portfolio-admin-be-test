const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
    subscribeUser,
    unsubscribeUser,
    sendNewsletter,
    getAllSubscribers
} = require("../controller/subscriber.controller");

router.get("/list", authMiddleware, getAllSubscribers);
router.post("/subscribe", subscribeUser);
router.post("/unsubscribe", unsubscribeUser);
router.post("/send-newsletter", authMiddleware, sendNewsletter);

module.exports = router;
