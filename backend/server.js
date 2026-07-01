require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const documentRoutes = require("./routes/documents");
const Document = require("./models/Document");

const app = express();
const server = http.createServer(app);

// Allow our React app (running on a different port) to talk to this server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// ---------- REST API routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => {
  res.send("SyncWrite API is running ✅");
});

// ---------- Connect to MongoDB ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ---------- Socket.IO real-time collaboration ----------
// We verify the user's token when they connect, so only logged-in users can join.
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Not authenticated"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Not authenticated"));
  }
});

io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);

  // The client tells us which document they are opening.
  // We put them in a "room" named after the document ID, so updates
  // are only sent to people viewing the SAME document.
  socket.on("join-document", async (documentId) => {
    socket.join(documentId);

    // Send the latest saved content to the person who just joined
    const document = await Document.findById(documentId);
    if (document) {
      socket.emit("load-document", document.content);
    }
  });

  // Whenever one user types, broadcast the new content to everyone
  // else in the same document room (but not back to the sender).
  socket.on("send-changes", ({ documentId, content }) => {
    socket.to(documentId).emit("receive-changes", content);
  });

  // Save the document content to the database.
  // The frontend calls this every couple of seconds (debounced),
  // not on every single keystroke, to keep things simple and efficient.
  socket.on("save-document", async ({ documentId, content }) => {
    try {
      await Document.findByIdAndUpdate(documentId, { content });
    } catch (err) {
      console.error("Error saving document:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
