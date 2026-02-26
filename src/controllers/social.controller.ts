import { Response } from "express";
import mongoose from "mongoose";
import Profile from "../models/Profile";
import { AuthRequest } from "../middleware/auth.middleware";

/* =====================================================
   GET SOCIAL LINKS BY TENANT
===================================================== */
export const getSocial = async (
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
      data: profile?.social?.links || [],
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   UPSERT SOCIAL LINKS
===================================================== */
export const upsertSocial = async (
  req: AuthRequest & { params: { tenantId: string } },
  res: Response,
) => {
  try {
    const { tenantId } = req.params;
    const user = req.user;
    const { links } = req.body;

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

    if (!Array.isArray(links)) {
      return res.status(400).json({
        success: false,
        message: "Links must be an array",
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

    /* ================= CLEAN + VALIDATE LINKS ================= */

    const cleanedLinks = links
      .map((link: any) => ({
        platform: String(link.platform || "website").trim(),
        url: String(link.url || "").trim(),
      }))
      .filter((link: any) => link.url !== "");

    /* Optional: Prevent duplicate platforms */
    const uniqueLinks = Array.from(
      new Map(cleanedLinks.map((l) => [l.platform, l])).values(),
    );

    profile.social = {
      links: uniqueLinks,
    };

    await profile.save();

    return res.json({
      success: true,
      message: "Social links saved successfully",
      data: profile.social.links,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
