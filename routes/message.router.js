const express = require("express");
require("dotenv").config();

const messageController = require("../controllers/message.controller");
const router = express.Router();

router.post("/new/", messageController.postMessage);
router.get("/list/:id", messageController.getMessages);
router.get("/conversation/", messageController.getConversation);

// export default router;
module.exports = router;
