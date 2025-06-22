const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const onlineUsers = {}; // userId -> socket.id

io.on("connection", (socket) => {
  console.log("📡 User connected:", socket.id);

   socket.on("test", (msg) => {
    console.log("Received from client:", msg);
    socket.emit("test-reply", "hello from server");
    console.log("Sent to client: hello from server");
  });
   socket.on("test-audio", (audioBlob) => {
    // Echo the audio back to all clients for testing
    io.emit("test-audio", audioBlob);
    console.log("Audio sent via socket");
  });

    socket.on("send-translated-audio", (audioBlob) => {
    // Broadcast to all other users except the sender
    socket.broadcast.emit("receive-translated-audio", audioBlob);
    console.log("Translated audio sent to other users");
  });

  socket.on("register", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("✅ Registered user:", userId, "→", socket.id);
  });

  socket.on("call-user", ({ from, to, signal }) => {
    const targetSocketId = onlineUsers[to];
    console.log("📞 call-user from", from, "to", to);

    if (targetSocketId) {
      io.to(targetSocketId).emit("incoming-call", { from });
      console.log("📤 Sent incoming-call to", to, "at socket", targetSocketId);
    } else {
      console.log("⚠️ Target user not found or offline");
    }
  });

  socket.on("call-accepted", ({ from, to }) => {
    const callerSocket = onlineUsers[to];
    if (callerSocket) {
      io.to(callerSocket).emit("call-accepted", { from });
      console.log("✅ Sent call-accepted to", to, "from", from);
    }
  });

  socket.on("call-declined", ({ from, to }) => {
    const callerSocket = onlineUsers[to];
    if (callerSocket) {
      io.to(callerSocket).emit("call-declined", { from });
      console.log("❌ Sent call-declined to", to, "from", from);
    }
  });

  // ⭐ WebRTC Signal Exchange
  socket.on("webrtc-offer", ({ to, offer }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("webrtc-offer", {
        from: getUserIdBySocket(socket.id),
        offer
      });
      console.log("📡 Sent WebRTC offer from", socket.id, "to", targetSocket);
    }
  });

  socket.on("webrtc-answer", ({ to, answer }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("webrtc-answer", {
        from: getUserIdBySocket(socket.id),
        answer
      });
      console.log("📡 Sent WebRTC answer from", socket.id, "to", targetSocket);
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("ice-candidate", {
        from: getUserIdBySocket(socket.id),
        candidate
      });
      console.log("📡 Sent ICE candidate from", socket.id, "to", targetSocket);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        console.log("🧹 Removed user:", userId);
        break;
      }
    }
  });

  function getUserIdBySocket(socketId) {
    return Object.keys(onlineUsers).find((id) => onlineUsers[id] === socketId);
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log("🔌 Real-time signaling server running on port", PORT);
});
