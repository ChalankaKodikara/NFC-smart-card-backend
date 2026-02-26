import express from "express";
import { getPublicProfile } from "../controllers/public.controller";

const router = express.Router();

router.get("/:slug", getPublicProfile);

export default router;
