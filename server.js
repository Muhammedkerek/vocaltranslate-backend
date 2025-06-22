require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = require("./app"); // your existing Express routes
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // later set this to your Netlify domain for security
    methods: ["GET", "POST"]
}});

const onlineUsers = {};

// ✅ WebSocket Events
io.on("connection", (socket) => {
  console.log("📡 User connected:", socket.id);

  socket.on("test", (msg) => {
    console.log("Received from client:", msg);
    socket.emit("test-reply", "hello from server");
  });

  socket.on("test-audio", (audioBlob) => {
    io.emit("test-audio", audioBlob);
  });

  socket.on("send-translated-audio", (audioBlob) => {
    socket.broadcast.emit("receive-translated-audio", audioBlob);
  });

  socket.on("register", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("✅ Registered user:", userId, "→", socket.id);
  });

  socket.on("call-user", ({ from, to }) => {
    const targetSocketId = onlineUsers[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("incoming-call", { from });
    }
  });

  socket.on("call-accepted", ({ from, to }) => {
    const callerSocket = onlineUsers[to];
    if (callerSocket) {
      io.to(callerSocket).emit("call-accepted", { from });
    }
  });

  socket.on("call-declined", ({ from, to }) => {
    const callerSocket = onlineUsers[to];
    if (callerSocket) {
      io.to(callerSocket).emit("call-declined", { from });
    }
  });

  socket.on("webrtc-offer", ({ to, offer }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("webrtc-offer", {
        from: getUserIdBySocket(socket.id),
        offer
      });
    }
  });

  socket.on("webrtc-answer", ({ to, answer }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("webrtc-answer", {
        from: getUserIdBySocket(socket.id),
        answer
      });
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("ice-candidate", {
        from: getUserIdBySocket(socket.id),
        candidate
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
  });

  function getUserIdBySocket(socketId) {
    return Object.keys(onlineUsers).find((id) => onlineUsers[id] === socketId);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("🚀 Server with Express + WebSocket running on port", PORT);
});
