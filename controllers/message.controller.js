const redis = require("../utils/redis.utils");

/**
 * POST A NEW MESSAGE
 */
exports.postMessage = async (req, res) => {
    //* get IDs & message from the body
    let senderId = req.body.id;
    let recipientId = req.body.recipient;
    let message = req.body.message;
    // console.log(senderId);
    // console.log(recipientId);
    // console.log(message);
    if (
        senderId === undefined ||
        recipientId === undefined ||
        message === undefined
    ) {
        let error = {
            Error: "Aucun champs ne peut être vide.",
            senderId: senderId,
            recipientId: recipientId,
            message: message,
        };
        res.status(400).send(error);
    } else {
        //* find if oldData exists
        let oldData = await redis.getData(senderId);
        //* init data and messageBox
        let data;
        let box = {
            date: new Date(),
            message: message,
            recipient: recipientId,
            sender: senderId,
        };
        //* if not exist , creating new one
        if (oldData === null) {
            data = await redis.setData(
                senderId,
                "[" + JSON.stringify(box) + "]"
            );
        }
        //* if not exist , concat with old data
        else {
            let newData =
                oldData.slice(0, -1) + " , " + JSON.stringify(box) + "]";
            data = await redis.setData(senderId, newData);
        }
        res.status(201).send(data);
    }
};

/**
 * GET ALL MESSAGES FOR A SENDER BY ID
 */
exports.getMessages = async (req, res) => {
    let senderId = req.params.id;

    let list = await redis.getData(senderId);
    if (list === null || list.length === 0) {
        res.status(202).send("Aucun messages pour le user #" + senderId);
    } else {
        res.status(200).send(JSON.parse(list));
    }
};

/**
 * GET A CONVERSATION BETWEEN 2 USERS , OLDER MESSAGE FIRST
 */
exports.getConversation = async (req, res) => {
    let conversation = [];
    let userOne = req.body.firstUserId;
    let userTwo = req.body.secondUserId;
    let userOneMess = await redis.getData(userOne);
    let userTwoMess = await redis.getData(userTwo);

    JSON.parse(userOneMess).forEach(async (msg) => {
        if (msg.recipient === userTwo) {
            conversation.push(msg);
        }
    });

    JSON.parse(userTwoMess).forEach(async (msg) => {
        if (msg.recipient === userOne) {
            conversation.push(msg);
        }
    });

    conversation.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    // console.log(conversation);
    res.status(200).send(conversation);
};
