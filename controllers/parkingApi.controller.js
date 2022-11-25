const axios = require("axios");
require("dotenv").config();
const redis = require("../utils/redis.utils");

const parkingApiKey = process.env.API_KEY;
const parkingTypename = process.env.API_TYPENAME;
const parkingUrl =
    "https://data.bordeaux-metropole.fr/geojson?key=" +
    parkingApiKey +
    "&typename=" +
    parkingTypename;

/**
 * GET ALL PARKINGS FROM API AND STORE THEM IN REDIS
 */
exports.getParkingPublic = async (req, res) => {
    //* mapping redis key according to request url , sliced first "/"
    let key = req.url;
    key = key.slice(1);

    //* getting data from the cache if cache is present for the given key
    const cachedData = await redis.getData(key);
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
            redis.setData(key, JSON.stringify(data.data));
            console.log("Putting data in cache ...");
            return res.status(200).json(data.data);
        })
        .catch((error) => {
            return res.status(500).json(error);
        });
};
