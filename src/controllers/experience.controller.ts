import { Response } from "express";
import mongoose from "mongoose";
import Profile from "../models/Profile";
import { AuthRequest } from "../middleware/auth.middleware";

/* =====================================================
   GET EXPERIENCES
===================================================== */
export const getExperience = async (
  req: AuthRequest & { params: { tenantId: string } },
  res: Response,
) => {
  try {
    const { tenantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tenant ID",
      });
    }

    const profile = await Profile.findOne({ tenantId });

    if (!profile) {
      return res.json({
        success: true,
        data: [],
      });
    }

    return res.json({
      success: true,
      data: profile.experiences || [],
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   UPSERT EXPERIENCES
===================================================== */
export const upsertExperience = async (
  req: AuthRequest & { params: { tenantId: string } },
  res: Response,
) => {
  try {
    const { tenantId } = req.params;
    const user = req.user;
    const { experiences } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tenant ID",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!Array.isArray(experiences)) {
      return res.status(400).json({
        success: false,
        message: "Experiences must be an array",
      });
    }

    let profile = await Profile.findOne({ tenantId });

    /* ================= AUTHORIZATION ================= */

    if (profile) {
      if (user.role !== "SUPER_ADMIN") {
        if (profile.userId.toString() !== user.id) {
          return res.status(403).json({
            success: false,
            message: "Unauthorized",
          });
        }
      }
    }

    /* ================= CREATE IF NOT EXISTS ================= */

    if (!profile) {
      profile = new Profile({
        tenantId,
        userId: user.id,
        slug: `tenant-${tenantId}`,
      });
    }

    /* ================= UPDATE EXPERIENCES ================= */

    profile.experiences = experiences;

    await profile.save();

    return res.json({
      success: true,
      message: "Experiences saved successfully",
      data: profile.experiences,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   UPLOAD LOGO
===================================================== */
export const uploadLogo = async (
  req: AuthRequest & { params: { tenantId: string } } & any,
  res: Response,
) => {
  try {
    const { tenantId } = req.params;
    const user = req.user;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tenant ID",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const profile = await Profile.findOne({ tenantId });

    if (profile) {
      if (user.role !== "SUPER_ADMIN") {
        if (profile.userId.toString() !== user.id) {
          return res.status(403).json({
            success: false,
            message: "Unauthorized",
          });
        }
      }
    }

    const imageUrl = `/uploads/experience/${req.file.filename}`;

    return res.json({
      success: true,
      url: imageUrl,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
