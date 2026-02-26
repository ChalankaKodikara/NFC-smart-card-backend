import express from "express";
import {
  getProfileByToken,
  updatePersonal,
  updateContact,
  updateSocial,
  updateExperience,
  updateCustomSection,
  deleteCustomSection,
} from "../controllers/clientProfile.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", verifyToken, getProfileByToken);

router.put("/personal", verifyToken, updatePersonal);
router.put("/contact", verifyToken, updateContact);
router.put("/social", verifyToken, updateSocial);
router.put("/experience", verifyToken, updateExperience);

router.put("/custom/:id", verifyToken, updateCustomSection);
router.delete("/custom/:id", verifyToken, deleteCustomSection);

export default router;
