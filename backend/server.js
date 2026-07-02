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

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => {
  res.send("SyncWrite API is running ✅");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error(
      "❌ MongoDB connection error:",
      err.message
    );
  });

// Authenticate socket connections.
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Not authenticated"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    socket.userId = decoded.id;

    next();
  } catch (err) {
    next(new Error("Not authenticated"));
  }
});

io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  socket.on("join-document", async (documentId) => {
    socket.join(documentId);

    try {
      const document = await Document.findById(documentId);

      if (document) {
        socket.emit(
          "load-document",
          document.content
        );
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on(
    "send-changes",
    ({ documentId, content }) => {
      socket
        .to(documentId)
        .emit("receive-changes", content);
    }
  );

  socket.on(
    "save-document",
    async ({ documentId, content }) => {
      try {
        await Document.findByIdAndUpdate(
          documentId,
          {
            content,
          }
        );
      } catch (err) {
        console.error(
          "Error saving document:",
          err.message
        );
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});