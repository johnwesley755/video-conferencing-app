// src/utils/handleSocketConnection.ts
import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ExtendedSocket } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const handleSocketConnection = (socket: Socket, io: Server) => {
  const token = socket.handshake.auth.token as string;

  if (!token) {
    console.log("No token provided. Disconnecting socket...");
    return socket.disconnect();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      console.log("Invalid token. Disconnecting socket...");
      return socket.disconnect();
    }

    const username = (decoded as JwtPayload).username;
    (socket as ExtendedSocket).username = username;
    console.log(`User connected: ${username}`);
  });

  socket.on("message", (message: string) => {
    const username = (socket as ExtendedSocket).username || "Unknown";
    io.emit("message", `${username}: ${message}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
};
