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
};

exports.redisDisconnect = () => {
    redisClient.disconnect();
    console.log("Redis disconnected.");
};

/**
 * GET REDIS DATA BY KEY
 * @param {string} key redis key to get
 * @returns
 */
exports.getData = async (key) => {
    this.redisConnection();
    try {
        const results = await redisClient.get(key);
        if (results) {
            console.log("key exist !");
            this.redisDisconnect();
            return results;
        } else {
            console.log("key don't exist.");
            this.redisDisconnect();
            return null;
        }
    } catch (error) {
        console.log(error);
    }
};

/**
 * SET DATA IN REDIS
 * @param {string} key
 * @param {string} datas
 * @returns
 */
exports.setData = async (key, datas) => {
    this.redisConnection();
    try {
        redisClient.set(key, datas, function (err, reply) {
            // console.log(reply); // OK
        });
        let data = await redisClient.get(key);
        this.redisDisconnect();
        return data;
    } catch (error) {
        console.log(error);
        this.redisDisconnect();
    }
};
