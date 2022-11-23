const express = require("express");
const axios = require("axios");
const redis = require("redis");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;


app.use(cors({origin:'*'}));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
//app.use(upload.array()); // for parsing multipart/form-data

const requestUrl = "https://jsonplaceholder.typicode.com/posts";

const parkingApiKey = process.env.API_KEY;
const parkingTypename = process.env.API_TYPENAME;

const parkingUrl =
    "https://data.bordeaux-metropole.fr/geojson?key=" +
    parkingApiKey +
    "&typename=" +
    parkingTypename;

//* configuring and creating redis client
const redisClient = redis.createClient({
    host: "127.0.0.1", //* Redis Host URL
    port: 6379, //* Redis Host PORT number
    password: null, //* Host password null if empty
});

//* connecting to the redis data store
function redisConnection() {
    redisClient.connect();
    console.log("Connection made with Redis");
}


async function getData(key) {
  try {
      const results = await redisClient.get(key);
      if (results) {
          console.log("key exist !");
        return results;
      } else {
          console.log("key don't exist.");
        return null;
      }
  } catch (error) {
      console.log(error);
  }
}

async function setData(key, datas) {
  try {
      // let isData = await redisClient.get(key);
      // if (isData) {
      //   return isData;
      // }

      redisClient.set(key, datas, function (err, reply) {
          console.log(reply); // OK
      });
      let data = await redisClient.get(key);
      return data;
  } catch (error) {
      console.log(error);
  }
}

/**
 * GET ALL PARKINGS FROM API AND STORE THEM IN REDIS
 */
app.get("/parking-public", async (req, res) => {
    //* mapping redis key according to request url
  let key = req.url;
  key = key.slice(1);

    //* getting data from the cache if cache is present for the given key
    const cachedData = await redisClient.get(key);
    if (cachedData) {
        console.log("Cache existing !!!");
        //* parsing data as data is saved in string format in redis
        return res.status(200).json(JSON.parse(cachedData));
    }

    //* fetching data from the requestUrl
    axios
        .get(parkingUrl)
        .then((data) => {
            console.log("Cache missing...");
            //* putting data in cache in string format
            redisClient.set(key, JSON.stringify(data.data));
            console.log("Putting data in cache ...");
            return res.status(200).json(data.data);
        })
        .catch((error) => {
            return res.status(500).json(error);
        });
});


/**
 * SET A REDIS KEY (test)
 */
app.get("/redis/set/:id", async (req, res) => {
  let id = req.params.id;
  console.log("set redis: " + id);
  let data = await setData(id, "Date : "+Date());
  res.send(data)
});

/**
 * GET A REDIS KEY (test)
 */
app.get("/redis/get/:id", async (req, res) => {
  let id = req.params.id;
  console.log("get redis: " + id);
  let data = await getData(id);
  res.send(data)
});

/**
 * POST A NEW MESSAGE
 */
app.post("/message", async (req, res) => {
  //* get IDs & message from the body
  let senderId = req.body.id;
  let recipientId = req.body.recipient
  let message = req.body.message
  console.log(senderId);
  console.log(recipientId);
  console.log(message);
  if (senderId === undefined || recipientId === undefined || message === undefined) {
    let error = {
      "Error" : "Aucun champs ne peut être vide.", 
      "senderId" : senderId, 
      "recipientId" : recipientId, 
      "message" : message, 
    }
    res.send(error);
  }
  else {
    //* find if oldData exists
    let oldData = await getData(senderId);
    // console.log("oldData : " + JSON.stringify(oldData))
    //* init data and messageBox
    let data;
    let box = {
      "date": new Date(),
      "message": message,
      "recipient" : recipientId
    }
    //* if not exist , creating new one
    if (oldData === null) {
      data = await setData(senderId, "[" + JSON.stringify(box) + "]")
    }
    //* if not exist , concat with old data
    else {
      let newData = oldData.slice(0 , -1) + " , " + JSON.stringify(box) + "]"
      data = await setData(senderId, newData)
    }
    res.send(data);
    
  }
});

/**
 * GET ALL MESSAGES FOR A SENDER BY ID
 */
app.get("/messages/:id", async (req, res) => {
  let senderId = req.params.id;

  let list = await getData(senderId);
  // console.log(list);
  if (list === null ||  list.length === 0) {
    res.send("Aucun messages pour le user #" + senderId)
  } else {
    res.send(JSON.parse(list));
  }


})



app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    redisConnection();
});
