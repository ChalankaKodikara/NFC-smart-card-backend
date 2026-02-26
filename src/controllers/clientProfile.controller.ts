import { Request, Response } from "express";
import ClientProfile from "../models/ClientProfile";
import Tenant from "../models/Tenant";
import path from "path";
import fs from "fs";


export const getProfileByToken = async (req: any, res: Response) => {
  try {
    const user = req.user;

    let profile = await ClientProfile.findOne({
      tenantId: user.tenantId,
    });

    if (!profile) {
      profile = await ClientProfile.create({
        tenantId: user.tenantId,
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const updatePersonal = async (req: any, res: Response) => {
  try {
    const user = req.user;

    const profile = await ClientProfile.findOneAndUpdate(
      { tenantId: user.tenantId },
      { $set: { personal: req.body } },
      { new: true, upsert: true },
    );

    res.json({
      success: true,
      message: "Personal updated",
      data: profile.personal,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const updateContact = async (req: any, res: Response) => {
  try {
    const user = req.user;

    const profile = await ClientProfile.findOneAndUpdate(
      { tenantId: user.tenantId },
      { $set: { contact: req.body } },
      { new: true, upsert: true },
    );

    res.json({
      success: true,
      message: "Contact updated",
      data: profile.contact,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateSocial = async (req: any, res: Response) => {
  try {
    const user = req.user;

    const profile = await ClientProfile.findOneAndUpdate(
      { tenantId: user.tenantId },
      { $set: { social: req.body.links } },
      { new: true, upsert: true },
    );

    res.json({
      success: true,
      message: "Social updated",
      data: profile.social,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const updateExperience = async (req: any, res: Response) => {
  try {
    const user = req.user;

    const profile = await ClientProfile.findOneAndUpdate(
      { tenantId: user.tenantId },
      { $set: { experience: req.body.experiences } },
      { new: true, upsert: true },
    );

    res.json({
      success: true,
      message: "Experience updated",
      data: profile.experience,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const updateCustomSection = async (req: any, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const profile = await ClientProfile.findOne({
      tenantId: user.tenantId,
    });

    if (!profile)
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });

    const index = profile.customSections.findIndex((s: any) => s.id === id);

    if (index >= 0) {
      profile.customSections[index] = req.body;
    } else {
      profile.customSections.push(req.body);
    }

    await profile.save();

    res.json({
      success: true,
      message: "Custom section saved",
      data: profile.customSections,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteCustomSection = async (req: any, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const profile = await ClientProfile.findOne({
      tenantId: user.tenantId,
    });

    if (!profile)
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });

    profile.customSections = profile.customSections.filter(
      (s: any) => s.id !== id,
    );

    await profile.save();

    res.json({
      success: true,
      message: "Custom section deleted",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
