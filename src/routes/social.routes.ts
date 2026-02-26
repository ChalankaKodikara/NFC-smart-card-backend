import express from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { getSocial, upsertSocial } from "../controllers/social.controller";

const router = express.Router();

router.get("/:tenantId", getSocial);

router.put("/:tenantId", verifyToken, upsertSocial);

export default router;
