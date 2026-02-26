import { Request, Response } from "express";
import Tenant from "../models/Tenant";
import Profile from "../models/Profile";

export const getPublicProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug || Array.isArray(slug)) {
      res.status(400).json({
        success: false,
        message: "Invalid slug",
      });
      return;
    }

    // 🔥 Step 1: Find tenant by slug
    const tenant = await Tenant.findOne({
      slug: slug.toLowerCase(),
      status: "ACTIVE",
    }).lean();

    if (!tenant) {
      res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
      return;
    }

    // 🔥 Step 2: Find profile by tenantId
    const profile = await Profile.findOne({
      tenantId: tenant._id,
    }).lean();

    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Profile not found",
      });
      return;
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error("Public profile error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
