// src/server.ts
import express, { Application } from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import videoRoutes from "./routes/videoRoutes";
import { handleSocketConnection } from "./socket";

// Load environment variables
dotenv.config();

// Initialize Express app and HTTP server
const app: Application = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/video", videoRoutes);

// Socket.IO connection handler
io.on("connection", (socket) => handleSocketConnection(socket, io));

// MongoDB Connection
const MONGO_URI: string | undefined = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MongoDB URI is not defined. Please check your .env file.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err: unknown) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Server Initialization
const PORT: string | number = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

export { io };
export default app;
