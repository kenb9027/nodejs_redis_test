const redis = require("../utils/redis.utils");

/**
 * SET A REDIS KEY (test)
 */
exports.setRedis = async (req, res) => {
    let id = req.params.id;
    console.log("set redis: " + id);
    let data = await redis.setData(id, "Date : " + Date());
    res.send(data);
};

/**
 * GET A REDIS KEY (test)
 */
exports.getRedis = async (req, res) => {
    let id = req.params.id;
    console.log("get redis: " + id);
    let data = await redis.getData(id);
    res.send(data);
};
