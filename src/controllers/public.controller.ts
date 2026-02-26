import { Request, Response } from "express";
import Tenant from "../models/Tenant";
import Profile from "../models/Profile";

export const getPublicProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const startTime = Date.now();

  try {
    const { slug } = req.params;

    console.log("🌍 Public Profile Request:", {
      slug,
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      time: new Date().toISOString(),
    });

    if (!slug || Array.isArray(slug)) {
      console.warn("⚠️ Invalid slug received:", slug);

      res.status(400).json({
        success: false,
        message: "Invalid slug",
      });
      return;
    }

    // 🔥 Step 1: Find tenant
    const tenant = await Tenant.findOne({
      slug: slug.toLowerCase(),
      status: "ACTIVE",
    }).lean();

    if (!tenant) {
      console.warn("❌ Tenant not found:", slug);

      res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
      return;
    }

    // 🔥 Step 2: Find profile
    const profile = await Profile.findOne({
      tenantId: tenant._id,
    }).lean();

    if (!profile) {
      console.warn("❌ Profile not found for tenant:", tenant._id);

      res.status(404).json({
        success: false,
        message: "Profile not found",
      });
      return;
    }

    const duration = Date.now() - startTime;

    console.log("✅ Public Profile Loaded:", {
      slug,
      tenantId: tenant._id,
      duration: `${duration}ms`,
    });

    res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error("🔥 Public Profile Error:", {
      message: error.message,
      stack: error.stack,
      slug: req.params.slug,
      time: new Date().toISOString(),
    });

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};