import { Response } from "express";
import mongoose from "mongoose";
import Profile from "../models/Profile";
import { AuthRequest } from "../middleware/auth.middleware";

/* =====================================================
   GET CONTACT DETAILS BY TENANT
===================================================== */
export const getContactDetails = async (
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

    const profile = await Profile.findOne({
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });

    return res.json({
      success: true,
      data: profile?.contact || {
        email: "",
        phone: "",
        location: "",
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   UPSERT CONTACT DETAILS
===================================================== */
export const upsertContactDetails = async (
  req: AuthRequest & { params: { tenantId: string } },
  res: Response,
) => {
  try {
    const { tenantId } = req.params;
    const user = req.user;
    const { email, phone, location } = req.body;

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

    let profile = await Profile.findOne({
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });

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
        tenantId: new mongoose.Types.ObjectId(tenantId),
        userId: user.id,
        slug: `tenant-${tenantId}`,
      });
    }

    /* ================= UPDATE CONTACT ================= */

    profile.contact = {
      email: email?.trim() || "",
      phone: phone?.trim() || "",
      location: location?.trim() || "",
    };

    await profile.save();

    return res.json({
      success: true,
      message: "Contact details saved successfully",
      data: profile.contact,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
