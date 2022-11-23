const express = require("express");

const parkingApiController = require("../controllers/parkingApi.controller");

require('dotenv').config();

const router = express.Router();

router.get("/", parkingApiController.getParkingPublic);

// export default router;
module.exports = router;