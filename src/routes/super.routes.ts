import { Router } from "express";
import {
  createTenant,
  createAdmin,
  resetClientPassword,
} from "../controllers/super.controller";

import { verifyToken } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/role.middleware";
import { Role } from "../models/User";

const router = Router();

/* =========================================================
   🔒 Protect all routes below (SUPER ADMIN ONLY)
========================================================= */

router.use(verifyToken, allowRoles(Role.SUPER_ADMIN));

/* =========================================================
   🔥 SUPER ADMIN ROUTES
========================================================= */

router.post("/tenant", createTenant);
router.post("/admin", createAdmin);

/* 🔥 RESET CLIENT PASSWORD */
router.post("/reset-password/:userId", resetClientPassword);

export default router;
