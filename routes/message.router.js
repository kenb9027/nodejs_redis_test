const express = require("express");

const messageController = require("../controllers/message.controller");

require('dotenv').config();

const router = express.Router();

router.post("/new/", messageController.postMessage);
router.get("/list/:id", messageController.getMessages);

// export default router;
module.exports = router;