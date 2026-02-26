import express from "express";
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  changeStatus,
  getClientAdmins,
  getClientStats,
} from "../controllers/admin.controller";

import { verifyToken , allowRoles } from "../middleware/auth.middleware";
import { Role } from "../models/User";

const router = express.Router();

/* =========================================
   SUPER ADMIN ONLY ROUTES
========================================= */
/* Protect all routes */
router.use(
  verifyToken,
  allowRoles(Role.SUPER_ADMIN)
);

/* CLIENT MANAGEMENT */
router.post("/clients", createClient);
router.get("/clients/stats", getClientStats);

router.get("/clients", getClients);
router.get("/clients/:id", getClientById);
router.put("/clients/:id", updateClient);
router.delete("/clients/:id", deleteClient);
router.patch("/clients/:id/status", changeStatus);
/* CLIENT ADMIN MANAGEMENT */
router.get("/clients/:id/admins", getClientAdmins);

export default router;
