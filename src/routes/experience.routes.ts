import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.middleware";
import {
  getExperience,
  upsertExperience,
  uploadLogo,
} from "../controllers/experience.controller";

const router = express.Router();

/* ================= MULTER MEMORY STORAGE ================= */

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

/* ================= ROUTES ================= */

router.get("/:tenantId", getExperience);

router.put("/:tenantId", verifyToken, upsertExperience);

router.post(
  "/upload-logo/:tenantId",
  verifyToken,
  upload.single("logo"),
  uploadLogo,
);

export default router;
