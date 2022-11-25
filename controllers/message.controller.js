const redis = require("../utils/redis.utils");
const Conversation = require("../models").Conversation;
const { Op } = require("sequelize");
/**
 * POST A NEW MESSAGE
 */
exports.postMessage = async (req, res) => {
    // get IDs & message from the body
    let senderId = req.body.id;
    let recipientId = req.body.recipient;
    let message = req.body.message;

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
        // find if oldData exists
        let oldData = await redis.getData(senderId);
        // init data and messageBox
        let data;
        let box = {
            date: new Date(),
            message: message,
            recipient: recipientId,
            sender: senderId,
        };
        // if not exist , creating new one
        if (oldData === null) {
            data = await redis.setData(
                senderId,
                "[" + JSON.stringify(box) + "]"
            );
        }
        // if not exist , concat with old data
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

    if (userOneMess == null || userTwoMess == null) {
       console.log("One of the user have no message.");
    }
    //add messages to conversation for each user
    if (userOneMess != null ) {
        JSON.parse(userOneMess).forEach(async (msg) => {
            if (msg.recipient === userTwo) {
                conversation.push(msg);
            }
        });
    }
    if (userOneMess != null) {
        JSON.parse(userTwoMess).forEach(async (msg) => {
            if (msg.recipient === userOne) {
                conversation.push(msg);
            }
        });
    }
    //sort by date 
    conversation.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    // SAVE IN DB
    let db_conversation = {
        userOne: userOne,
        userTwo: userTwo,
        content: JSON.stringify(conversation),
    };

    //TODO: compare to db before save
    //find if exist
    // Conversation.findAll({
    //     where: {
    //         [Op.or]: [
    //           { userOne: userOne },
    //           { userOne: userTwo }
    //         ],
    //         [Op.or]: [
    //             { userTwo: userOne },
    //             { userTwo: userTwo }
    //           ],

    //       }
    // })
    // .then((data) => {
    //     const conversationDb = data.map((convDb) => {
    //         return convDb;
    //     });
    //     console.log(conversationDb)
    //     res.status(200).send(
    //             conversationDb
    //     );
    // })
    // .catch((err) => {
    //     console.log(err)
    // });

    Conversation.create(db_conversation)
        .then((result) => {
            res.status(201).send(result);
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send("Some error occured. Conversation were not created.");
        });

};
