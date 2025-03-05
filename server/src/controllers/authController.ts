import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// User Signup Controller
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "⚠️ Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "✅ User registered successfully" });
  } catch (error) {
    next(error);
  }
};

// User Login Controller
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "❌ Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

// Get User Profile
export const getProfile = (req: Request, res: Response): void => {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.json({ name: user.name, email: user.email });
};

// User Logout Controller
export const logout = (req: Request, res: Response): void => {
  res.status(200).json({ message: "✅ Successfully logged out" });
};
