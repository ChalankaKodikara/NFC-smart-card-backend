import express from "express";
import { verifyToken } from "../middleware/auth.middleware";
import {
  getContactDetails,
  upsertContactDetails,
} from "../controllers/contact.controller";

const router = express.Router();

router.get("/:tenantId", getContactDetails);
router.put("/:tenantId", verifyToken, upsertContactDetails);

export default router;
