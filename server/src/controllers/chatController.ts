// src/controllers/chatController.ts
import { Request, Response, NextFunction } from "express";

export const sendMessage = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { message, sender, room } = req.body;

    if (!message || !sender || !room) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    console.log(`Message from ${sender} in room ${room}: ${message}`);
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    next(error); // Pass errors to Express error handler
  }
};

export const getMessages = (req: Request, res: Response): void => {
  try {
    const messages = [
      "Message 1",    // Replace with actual messages
      "Message 2",    // Replace with actual messages
      "Message 3",    // Replace with actual messages
    ];
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};    