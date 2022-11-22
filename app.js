const express = require("express");
const axios = require("axios");
const redis = require("redis");
require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;

const requestUrl = "https://jsonplaceholder.typicode.com/posts";

const parkingApiKey = process.env.API_KEY;
const parkingTypename = process.env.API_TYPENAME;

const parkingUrl = "https://data.bordeaux-metropole.fr/geojson?key="+parkingApiKey+"&typename="+parkingTypename


//* configuring and creating redis client
const redisClient = redis.createClient({
    host: "127.0.0.1",  //* Redis Host URL
    port: 6379,  //* Redis Host PORT number
    password: null,  //* Host password null if empty
  });
  
//* connecting to the redis data store
function redisConnection() {
redisClient.connect();
console.log("Connection made with Redis");
  }


app.get("/parking-public", async (req, res) => {
    //* mapping redis key according to request url
    const key = req.url;

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
app.get("/redis/set/:id", (req, res) => {
  let id = req.params.id;  
  console.log('set redis: ' + id);

  async function setData(req, res) {

    try {
      
      let isDate = await redisClient.get(id)
      if (isDate) {
        res.send({
          fromCache: true,
          data: "already existing key : #" + id + " = " + isDate
        });
      }
      
      redisClient.set(id, 'Date : ' + Date() , function(err, reply) {
        console.log(reply); // OK
      }); 
      let date = await redisClient.get(id)
      res.send({
        fromCache: false,
        data: "new key added : #" + id + " = " + date
      });

    } catch (error) {
                console.log(error)

    }


  }
  setData(req, res);
    
});

app.get("/redis/get/:id", (req, res) => {
    
    let id = req.params.id;
    async function getData(req, res) {
        let results;
        let isCached = false;
      
        try {
          const cacheResults = await redisClient.get(id);
          if (cacheResults) {
            console.log("key exist !")
            isCached = true;
              results = cacheResults;
              res.send({
                fromCache: isCached,
                data: "existing key retrived : #" + id + " = " +results,
              });
          } else {
            console.log("key don't exist. Creating one ...")
            results = 'Date : ' + Date();
              await redisClient.set(id, results)
              res.send({
                fromCache: isCached,
                data: "new key added : #" + id + " = " +results,
              });
          }
      

        } catch (error) {
          console.log(error)
        }
    }
    
    getData(req, res);
    
});


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    redisConnection();
  });