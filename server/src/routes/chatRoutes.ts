// chatRoutes.ts
import express from "express";
import { sendMessage } from "../controllers/chatController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// Route for sending messages
router.post("/send-message", authMiddleware, sendMessage);

export default router;
