import { Request, Response, NextFunction } from "express";

// Validation for Signup Request
export const validateSignup = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res
      .status(400)
      .json({ message: "⚠️ All fields are required (name, email, password)" });
    return;
  }

  if (password.length < 6) {
    res
      .status(400)
      .json({ message: "⚠️ Password must be at least 6 characters long" });
    return;
  }

  next();
};

// Validation for Login Request
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res
      .status(400)
      .json({ message: "⚠️ Both email and password are required" });
    return;
  }

  next();
};

export default { validateSignup, validateLogin };
