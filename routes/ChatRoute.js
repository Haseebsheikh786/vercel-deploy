const express = require("express");

const {
  fetchAllChats,
  fetchChatByUserId,
  fetchMessagesByChatId,
  createChat,
  createMessage,
} = require("../controller/ChatController");

const router = express.Router();

router.route("/chat/:chatId").get(fetchMessagesByChatId);
router.route("/chat").post(createChat);
router.route("/message").post(createMessage);
router.route("/chats").get(fetchAllChats); 
router.route("/user/:userId").get(fetchChatByUserId);

module.exports = router; 
