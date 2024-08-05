const Chat = require("../models/Chat");
const Message = require("../models/Message");

exports.createChat = async (req, res) => {
  try {
    const { user, admin } = req.body;

    // Check if a chat already exists between the specified user and admin
    let existingChat = await Chat.findOne({ user, admin });

    if (existingChat) {
      // Chat already exists, return the existing chat's ID
      return res.status(200).json({ chatId: existingChat._id });
    }

    // If no chat exists, create a new one
    const newChat = new Chat({ user, admin });
    await newChat.save();

    // Return the newly created chat's ID
    res.status(201).json({ chatId: newChat._id });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.fetchAllChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("user")
      .populate("admin")
      .populate("messages");
    res.json(chats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// chatController.js

exports.fetchChatByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the chat by user ID and populate the related fields with only necessary data
    const chat = await Chat.findOne({ user: userId }).populate({
      path: "messages",
      model: "Message",
      populate: {
        path: "sender",
        model: "User",
        select: "_id userName role", // Only include these fields from the sender
      },
      select: "content createdAt", // Only include these fields from the messages
      options: { sort: { createdAt: 1 } }, // Ensuring messages are sorted by creation date
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Map the messages to include only the required fields
    const response = chat.messages.map((message) => ({
      message_id: message._id,
      content: message.content,
      sender_id: message.sender._id,
      sender_name: message.sender.userName,
      sender_role: message.sender.role,
      created_at: message.createdAt,
    }));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { sender, content, chat } = req.body;

    // Create and save the new message
    const newMessage = new Message({ sender, content, chat });
    const savedMessage = await newMessage.save();

    // Update the corresponding chat with the new message's ID
    await Chat.findByIdAndUpdate(chat, {
      $push: { messages: savedMessage._id },
    });

    // Populate the sender details in the saved message for response
    const populatedMessage = await savedMessage.populate({
      path: "sender",
      select: "_id userName role",
    });

    // Format the response with the required fields
    const response = {
      message_id: populatedMessage._id,
      content: populatedMessage.content,
      sender_id: populatedMessage.sender._id,
      sender_name: populatedMessage.sender.userName,
      sender_role: populatedMessage.sender.role,
      created_at: populatedMessage.createdAt,
    };

    // Send the formatted response
    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.fetchMessagesByChatId = async (req, res) => {
  try {
    const chatId = req.params.chatId; 
    // Fetch messages and populate sender
    const messages = await Message.find({ chat: chatId }).populate("sender");

    // Map the messages to the desired response format
    const response = messages.map((message) => ({
      message_id: message._id,
      content: message.content,
      sender_id: message.sender._id,
      sender_name: message.sender.userName,
      sender_role: message.sender.role,
      created_at: message.createdAt,
    }));

    // Send the formatted response
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
