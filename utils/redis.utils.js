const redis = require("redis");


//* configuring and creating redis client
const redisClient = redis.createClient({
    host: "127.0.0.1", //* Redis Host URL
    port: 6379, //* Redis Host PORT number
    password: null, //* Host password null if empty
});
exports.redisClient;

//* connecting to the redis data store
exports.redisConnection = () => {
    redisClient.connect();
    console.log("Connection made with Redis");
}


/**
 * GET REDIS DATA BY KEY
 * @param {string} key redis key to get
 * @returns 
 */
 exports.getData = async (key) => {
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
  
  /**
   * SET DATA IN REDIS
   * @param {string} key 
   * @param {string} datas 
   * @returns 
   */
  exports.setData = async (key, datas) => {
    try {
        // let isData = await redisClient.get(key);
        // if (isData) {
        //   return isData;
        // }
  
        redisClient.set(key, datas, function (err, reply) {
            // console.log(reply); // OK
        });
        let data = await redisClient.get(key);
        return data;
    } catch (error) {
        console.log(error);
    }
  }
  