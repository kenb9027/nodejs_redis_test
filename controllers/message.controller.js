const redis = require("../utils/redis.utils");

/**
 * POST A NEW MESSAGE
 */
exports.postMessage = async (req, res) => {
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
      let oldData = await redis.getData(senderId);
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
        data = await redis.setData(senderId, "[" + JSON.stringify(box) + "]")
      }
      //* if not exist , concat with old data
      else {
        let newData = oldData.slice(0 , -1) + " , " + JSON.stringify(box) + "]"
        data = await redis.setData(senderId, newData)
      }
      res.send(data);
      
    }
  };
  
  /**
   * GET ALL MESSAGES FOR A SENDER BY ID
   */
exports.getMessages = async (req, res) => {
    let senderId = req.params.id;
  
    let list = await redis.getData(senderId);
    // console.log(list);
    if (list === null || list.length === 0) {
        res.send("Aucun messages pour le user #" + senderId)
    } else {
        res.send(JSON.parse(list));
    }
  
  
};