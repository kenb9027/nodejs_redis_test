const express = require("express");
const axios = require("axios");
const redis = require("redis");

const app = express();
const port = process.env.PORT || 3000;

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

    await redisClient.connect();
    console.log('redisClient connected !')
})();


app.get("/", (req, res) => {
    
    res.send("Hello, World!");
    
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


    // console.log('get redis')
    // redisClient.get('redis', function (err, reply) {
    //     console.log(reply); // Bonjour !
    //     res.send(reply);
    // });

    
});


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });