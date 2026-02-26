import { Response } from "express";
import mongoose from "mongoose";
import Profile from "../models/Profile";
import { AuthRequest } from "../middleware/auth.middleware";

/* =====================================================
   GET PERSONAL PROFILE
===================================================== */
export const getPersonal = async (
  req: AuthRequest & { params: { tenantId: string } },
  res: Response,
) => {
  try {
    const tenantId = req.params.tenantId;

    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tenant ID",
      });
    }

    const profile = await Profile.findOne({ tenantId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.json({
      success: true,
      data: profile.personal,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   UPSERT PERSONAL PROFILE
===================================================== */
export const upsertPersonal = async (
  req: AuthRequest & { params: { tenantId: string } } & any,
  res: Response,
) => {
  try {
    const tenantId = req.params.tenantId;
    const user = req.user;

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

    let profile = await Profile.findOne({ tenantId });

    // Authorization
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

    // Create if not exists
    if (!profile) {
      profile = new Profile({
        tenantId,
        userId: user.id,
        slug: req.body.slug || `tenant-${tenantId}`,
      });
    }

    const { name, slogan, bio } = req.body;

    if (name !== undefined) profile.personal.name = name;
    if (slogan !== undefined) profile.personal.slogan = slogan;
    if (bio !== undefined) profile.personal.bio = bio;

    if (req.file) {
      profile.personal.profileImage = `/uploads/profile/${req.file.filename}`;
    }

    await profile.save();

    return res.json({
      success: true,
      message: "Profile saved successfully",
      data: profile.personal,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
