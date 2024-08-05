const Chat = require("./models/Chat");
const Message = require("./models/Message");

exports.socketHandler = (socket, io) => {
  console.log("A user connected");

  socket.on("joinChat", async (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);

    // Load existing messages for the chat
    const messages = await Message.find({ chat: chatId }).populate("sender");
    socket.emit("loadMessages", messages);
  });

  socket.on("sendMessage", async (messageData) => {
    try {
      const message = new Message(messageData);
      await message.save();
      io.to(messageData.chat).emit("receiveMessage", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
};
