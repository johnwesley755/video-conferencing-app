import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export const useSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000"); // Backend socket server URL
  }

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  return socket;
};
