const express = require("express");
const axios = require("axios");
const redis = require("redis");

const app = express();
const port = process.env.PORT || 3000;

const requestUrl = "https://jsonplaceholder.typicode.com/posts";


//* configuring and creating redis client
const client = redis.createClient({
    host: "127.0.0.1",  //* Redis Host URL
    port: 6379,  //* Redis Host PORT number
    password: null,  //* Host password null if empty
  });
  
//* connecting to the redis data store
function redisConnection() {
client.connect();
console.log("Connection made with Redis");
  }


app.get("/", async (req, res) => {
    //* mapping redis key according to request url
    const key = req.url;

    //* getting data from the cache if cache is present for the given key
    const cachedData = await client.get(key);
    if (cachedData) {
    console.log("!!! Cache Hit !!!");
    //* parsing data as data is saved in string format in redis
    return res.status(200).json(JSON.parse(cachedData));
    }

    //* fetching data from the requestUrl
    axios
    .get(requestUrl)
    .then((data) => {
        console.log("cache miss");
        //* putting data in cache in string format
        client.set(key, JSON.stringify(data.data));
        console.log("Putting data in cache ...");
        return res.status(200).json(data.data);
    })
    .catch((error) => {
        return res.status(500).json(error);
    });
});
app.get("/redis-set/:id", (req, res) => {
    let id = req.params.id;
    
    console.log('set redis')
    redisClient.set(id, 'Date : ' + Date() , function(err, reply) {
        // console.log(reply); // OK
    }); 
    res.send("new key #" + id + " ajoutée !");
    
});

app.get("/redis-get/:id", (req, res) => {
    
    let id = req.params.id;
    async function getData(req, res) {
        let results;
        let isCached = false;
      
        try {
          const cacheResults = await redisClient.get(id);
          if (cacheResults) {
            isCached = true;
              results = cacheResults;
              res.send({
                fromCache: isCached,
                data: "existing key retrived : #" + id + " = " +results,
              });
          } else {
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