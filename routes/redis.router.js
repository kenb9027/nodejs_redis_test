const express = require("express");

const redisController = require("../controllers/redis.controller");

require("dotenv").config();

const router = express.Router();

router.get("/get/:id", redisController.getRedis);
router.get("/set/:id", redisController.setRedis);

// export default router;
module.exports = router;
