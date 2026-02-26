// controllers/auth.controller.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { Role } from "../models/User";
import Tenant from "../models/Tenant";

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    /* ===============================
       1️⃣ Validate Input
    =============================== */
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    } 

    /* ===============================
       2️⃣ Find User
    =============================== */
    const user = await User.findOne({ username });

    if (!user || !user.password) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    /* ===============================
       3️⃣ Compare Password
    =============================== */
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    /* ===============================
       4️⃣ Get Tenant Slug (if client)
    =============================== */
    let tenantSlug: string | null = null;

    if (user.role === Role.CLIENT_ADMIN && user.tenantId) {
      const tenant = await Tenant.findById(user.tenantId);

      if (!tenant) {
        return res.status(400).json({
          success: false,
          message: "Tenant not found",
        });
      }

      tenantSlug = tenant.slug;
    }

    /* ===============================
       5️⃣ Generate Token (INCLUDES tenantSlug)
    =============================== */
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not defined");

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        tenantId: user.tenantId ?? null,
        tenantSlug, // 🔥 VERY IMPORTANT
      },
      secret,
      { expiresIn: "1d" },
    );

    /* ===============================
       6️⃣ Send Response
    =============================== */
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId ?? null,
        tenantSlug,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
