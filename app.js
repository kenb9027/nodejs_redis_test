const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const redis = require("./utils/redis.utils");

const redisRouter = require("./routes/redis.router");
const parkingApiRouter = require("./routes/parkingApi.router");
const messageRouter = require("./routes/message.router");

const app = express();
const port = process.env.PORT || 3000;


app.use(cors({origin:'*'}));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
//app.use(upload.array()); // for parsing multipart/form-data


//ROUTER

app.use("/redis" , redisRouter )
app.use("/parking-public", parkingApiRouter)
app.use("/message", messageRouter);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    redis.redisConnection();
});
