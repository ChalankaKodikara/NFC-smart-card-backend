import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verifyToken } from "../middleware/auth.middleware";
import {
  getExperience,
  upsertExperience,
  uploadLogo,
} from "../controllers/experience.controller";

const router = express.Router();

/* ================= MULTER SETUP ================= */

const uploadPath = path.join(__dirname, "../../uploads/experience");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadPath),
  filename: (_, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

/* ================= ROUTES ================= */

router.get("/:tenantId", getExperience);

router.put("/:tenantId", verifyToken, upsertExperience);

router.post(
  "/upload-logo/:tenantId",
  verifyToken,
  upload.single("logo"),
  uploadLogo
);

export default router;