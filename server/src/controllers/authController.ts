import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = "your_jwt_secret";
const user = { username: "john", password: bcrypt.hashSync("password123", 8) };

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (
    username === user.username &&
    bcrypt.compareSync(password, user.password)
  ) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

export const signup = (req: Request, res: Response) => {
  const { username, password } = req.body;
  user.username = username;
  user.password = bcrypt.hashSync(password, 8);
  res.status(201).json({ message: "User registered successfully" });
};

export const verifyToken = (req: Request, res: Response) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
  });
};