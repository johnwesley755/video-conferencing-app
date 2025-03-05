import { Router } from "express";
import {
  login,
  signup,
  logout,
  getProfile,
} from "../controllers/authController";
import validationMiddleware from "../middlewares/validationMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/signup", validationMiddleware.validateSignup, signup);
router.post("/login", validationMiddleware.validateLogin, login);
router.post("/logout", authMiddleware, logout);
router.get("/profile", authMiddleware, getProfile);

export default router;
