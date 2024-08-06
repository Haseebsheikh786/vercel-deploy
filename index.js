const express = require("express");
const dotenv = require("dotenv").config();
const dbConnect = require("./database/index");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");
const http = require("http"); // Required for creating the server
const { Server } = require("socket.io"); // Import Socket.io

const app = express();

const port = process.env.PORT || 8000;

app.use(cookieParser());

app.use(
  cors({
    origin: function (origin, callback) {
      return callback(null, true);
    },
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.use(express.json());

app.use(morgan("default"));
app.use(express.static(path.resolve(__dirname, "build")));

app.use(errorHandler);

app.use("/", require("./routes/AuthRoute"));
app.use("/products", require("./routes/ProductRoute"));
app.use("/brands", require("./routes/BrandRoute"));
app.use("/categories", require("./routes/CategoryRoute"));
app.use("/cart", require("./routes/CartRoute"));
app.use("/orders", require("./routes/OrderRoute"));
app.use("/api", require("./routes/ChatRoute"));

dbConnect();

// Create HTTP server and pass in the Express app
const server = http.createServer(app);

// Create a new instance of Socket.io by passing the HTTP server
const io = new Server(server, {
  cors: {
    origin: "https://e-shop-steel-chi.vercel.app", // Allow all origins (use caution in production)
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io event handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handling a new message event from the client
  socket.on("new_message", (data) => {
    console.log("Message received:", data);
    // Emit the message to all connected clients
    io.emit("receive_message", {
      message_id: null,
      content: data.content,
      sender_id: data.sender,
      sender_name: data.sender_name,
      sender_role: data.sender_role,
      created_at: new Date().toISOString(),
    });
  });

  // Handling disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
