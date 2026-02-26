import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Tenant from "../models/Tenant";
import User from "../models/User";


export const createClient = async (req: Request, res: Response) => {
  try {
    const { companyName, slug, adminName, adminEmail, adminPassword } =
      req.body;

    // 1️⃣ Create Tenant
    const tenant = await Tenant.create({
      companyName,
      slug,
    });

    // 2️⃣ Create Client Admin
    const hashed = await bcrypt.hash(adminPassword, 10);

    const admin = await User.create({
      username: adminEmail,
      name: adminName,
      email: adminEmail,
      password: hashed,
      role: "CLIENT_ADMIN",
      tenantId: tenant._id,
    });

    res.status(201).json({
      success: true,
      message: "Client created successfully",
      tenant,
      admin,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getClients = async (_req: Request, res: Response) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    count: tenants.length,
    data: tenants,
  });
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findById(id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Get all client admins
    const admins = await User.find({
      tenantId: id,
      role: "CLIENT_ADMIN",
    }).select("-password");

    const activeAdmins = admins.filter((a) => a.isActive).length;

    res.json({
      success: true,
      data: {
        tenant,
        admins,
        stats: {
          totalAdmins: admins.length,
          activeAdmins,
          status: tenant.status,
          createdAt: tenant.createdAt,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      companyName,
      slug,
      status,
      adminId,
      adminName,
      adminEmail,
      adminActive,
    } = req.body;

    /* ==============================
       1️⃣ UPDATE TENANT
    ============================== */

    const tenant = await Tenant.findById(id);

    if (!tenant)
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });

    if (companyName) tenant.companyName = companyName;
    if (slug) tenant.slug = slug;
    if (status) tenant.status = status;

    await tenant.save();

    /* ==============================
       2️⃣ UPDATE CLIENT ADMIN
    ============================== */

    let updatedAdmin = null;

    if (adminId) {
      const admin = await User.findById(adminId);

      if (admin) {
        if (adminName) admin.name = adminName;
        if (adminEmail) admin.email = adminEmail;
        if (adminActive !== undefined)
          admin.isActive = adminActive;

        await admin.save();
        updatedAdmin = admin;
      }
    }

    res.json({
      success: true,
      message: "Client updated successfully",
      data: {
        tenant,
        updatedAdmin,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant)
    return res.status(404).json({
      success: false,
      message: "Client not found",
    });

  tenant.status = "INACTIVE";
  await tenant.save();

  res.json({
    success: true,
    message: "Client deactivated",
  });
};

export const changeStatus = async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status))
    return res.status(400).json({
      success: false,
      message: "Invalid status",
    });

  const tenant = await Tenant.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );

  res.json({
    success: true,
    message: "Status updated",
    data: tenant,
  });
};

export const getClientAdmins = async (req: Request, res: Response) => {
  const admins = await User.find({
    tenantId: req.params.id,
    role: "CLIENT_ADMIN",
  }).select("-password");

  res.json({
    success: true,
    count: admins.length,
    data: admins,
  });
};

export const getClientStats = async (_req: Request, res: Response) => {
  try {
    const total = await Tenant.countDocuments();
    const active = await Tenant.countDocuments({ status: "ACTIVE" });
    const inactive = await Tenant.countDocuments({ status: "INACTIVE" });
    const suspended = await Tenant.countDocuments({ status: "SUSPENDED" });

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive,
        suspended,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};