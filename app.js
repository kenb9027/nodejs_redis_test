const express = require("express");
const cors = require("cors");
require("dotenv").config();


// LOADING ROUTES
const redisRouter = require("./routes/redis.router");
const parkingApiRouter = require("./routes/parkingApi.router");
const messageRouter = require("./routes/message.router");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

//ROUTER
app.use("/redis", redisRouter);
app.use("/parking-public", parkingApiRouter);
app.use("/message", messageRouter);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
