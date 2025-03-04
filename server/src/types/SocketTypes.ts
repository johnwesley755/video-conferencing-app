import { Socket } from "socket.io";

// Extending the Socket interface to include a username property
export interface ExtendedSocket extends Socket {
  username?: string;
}

// Defining the payload structure for JWT
export interface JWTPayload {
  username: string;
  iat?: number;
  exp?: number;
}
