import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Tenant from "../models/Tenant";
import User, { Role } from "../models/User";

/* =========================================================
   🔥 CREATE TENANT
========================================================= */

export const createTenant = async (req: Request, res: Response) => {
  try {
    const { companyName, slug } = req.body;

    if (!companyName || !slug) {
      return res.status(400).json({
        success: false,
        message: "companyName and slug are required",
      });
    }

    const existing = await Tenant.findOne({ slug });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists",
      });
    }

    const tenant = await Tenant.create({
      companyName,
      slug,
      status: "ACTIVE",
    });

    res.status(201).json({
      success: true,
      message: "Tenant created successfully",
      data: tenant,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   🔥 CREATE CLIENT ADMIN
========================================================= */

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, tenantId } = req.body;

    if (!name || !email || !password || !tenantId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashed,
      role: Role.CLIENT_ADMIN,
      tenantId,
    });

    res.status(201).json({
      success: true,
      message: "Client admin created",
      data: admin,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================================
   🔥 SUPER ADMIN RESET CLIENT PASSWORD
========================================================= */

export const resetClientPassword = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // 🔥 Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔥 Only allow reset for CLIENT_ADMIN
    if (user.role !== Role.CLIENT_ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Can only reset client admin passwords",
      });
    }

    // 🔐 Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};