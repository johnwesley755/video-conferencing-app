// src/routes/authRoutes.ts
import { Router } from "express";
import { login, signup } from "../controllers/authController";
import validationMiddleware from "../middlewares/validationMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getProfile } from "../controllers/authController";
const router = Router();

router.post("/signup", validationMiddleware.validateSignup, signup);
router.post("/login", validationMiddleware.validateLogin, login);
router.get("/profile", authMiddleware, getProfile);
export default router;
