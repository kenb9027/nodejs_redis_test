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

app.get("/redis/set/:id", async (req, res) => {
  let id = req.params.id;
  console.log("set redis: " + id);
  let data = await setData(id, "Date : "+Date());
  res.send(data)
});

app.get("/redis/get/:id", async (req, res) => {
  let id = req.params.id;
  console.log("get redis: " + id);
  let data = await getData(id);
  res.send(data)
});

app.post("/message", async (req, res) => {
  // console.log(req.body);
  let id = req.body.id;
  let message = req.body.message
  let oldData = await getData(id);
  // console.log("oldData : " + JSON.stringify(oldData))
  let data;
  let box = {
    "date": new Date(),
    "message" : message
  }
  if (oldData === null) {
    data = await setData(id, "[" + JSON.stringify(box) + "]")
  }
  else {
    let newData = oldData.slice(0 , -1) + " , " + JSON.stringify(box) + "]"
    data = await setData(id, newData)
  }
  res.send(data);
});

app.get("/messages/:id", async (req, res) => {
  let id = req.params.id;

  let list = await getData(id);
  console.log(list)
  res.send(JSON.parse(list));


})



app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    redisConnection();
});
