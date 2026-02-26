import { Response } from "express";
import mongoose from "mongoose";
import Profile from "../models/Profile";
import { AuthRequest } from "../middleware/auth.middleware";
import cloudinary from "../config/cloudinary";

/* =====================================================
   GET PERSONAL PROFILE
===================================================== */
export const getPersonal = async (
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
    console.error("GET PERSONAL ERROR:", error);
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
    const { tenantId } = req.params;
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

    if (!profile) {
      profile = new Profile({
        tenantId,
        userId: user.id,
        slug: req.body.slug || `tenant-${tenantId}`,
        personal: {},
      });
    }

    if (!profile.personal) {
      profile.personal = {};
    }

    const { name, slogan, bio } = req.body;

    if (name !== undefined) profile.personal.name = name;
    if (slogan !== undefined) profile.personal.slogan = slogan;
    if (bio !== undefined) profile.personal.bio = bio;

    /* ===============================
       IMAGE UPLOAD
    =============================== */
    if (req.file) {
      if (profile.personal.imagePublicId) {
        await cloudinary.uploader.destroy(profile.personal.imagePublicId);
      }

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `casknet/${tenantId}/profile`,
              resource_type: "image",
              transformation: [
                { width: 400, height: 400, crop: "fill", gravity: "face" },
                { quality: "auto" },
                { fetch_format: "auto" },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(req.file.buffer);
      });

      profile.personal.profileImage = uploadResult.secure_url;
      profile.personal.imagePublicId = uploadResult.public_id;
    }

    await profile.save();

    return res.json({
      success: true,
      message: "Profile saved successfully",
      data: profile.personal,
    });
  } catch (error: any) {
    console.error("UPSERT PERSONAL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};