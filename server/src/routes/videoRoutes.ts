import express from "express";
import { createRoom } from "../controllers/videoController";

const router = express.Router();

router.post("/room", createRoom);

export default router;
