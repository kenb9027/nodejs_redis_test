const express = require("express");
require("dotenv").config();

const parkingApiController = require("../controllers/parkingApi.controller");
const router = express.Router();

router.get("/", parkingApiController.getParkingPublic);

// export default router;
module.exports = router;
