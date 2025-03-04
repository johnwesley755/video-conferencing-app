// src/utils/handleSocketConnection.ts
import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ExtendedSocket } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const handleSocketConnection = (socket: Socket, io: Server) => {
  const token = socket.handshake.auth?.token as string;

  if (!token) {
    console.warn("No token provided. Disconnecting socket...");
    socket.emit("error", "Authentication token missing.");
    return socket.disconnect(true);
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      console.warn("Invalid token. Disconnecting socket...");
      socket.emit("error", "Authentication failed. Invalid token.");
      return socket.disconnect(true);
    }

    const username = (decoded as JwtPayload).username;
    (socket as ExtendedSocket).username = username;
    console.log(`User connected: ${username}`);

    // Join a room based on username if needed
    socket.join(username);

    // Handle incoming messages
    socket.on("message", (message: string) => {
      const sender = (socket as ExtendedSocket).username || "Unknown";
      console.log(`Message from ${sender}: ${message}`);
      io.emit("message", `${sender}: ${message}`);
    });

    // Handle socket disconnection
    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${username}. Reason: ${reason}`);
      socket.leave(username);
    });
  });
};

export default handleSocketConnection;