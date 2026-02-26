import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.middleware";
import {
  getPersonal,
  upsertPersonal,
} from "../controllers/personal.controller";

const router = express.Router();

/* =====================================================
   MULTER MEMORY STORAGE (NO FILESYSTEM)
===================================================== */

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

/* =====================================================
   ROUTES
===================================================== */

router.get("/:tenantId", getPersonal);

router.put(
  "/:tenantId",
  verifyToken,
  upload.single("image"), // file will be in req.file.buffer
  upsertPersonal,
);

export default router;
