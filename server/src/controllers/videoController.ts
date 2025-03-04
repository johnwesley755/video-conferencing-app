import { Request, Response } from "express";

export const createRoom = (req: Request, res: Response) => {
  const roomId = Math.random().toString(36).substring(7);
  res.json({ roomId });
};
