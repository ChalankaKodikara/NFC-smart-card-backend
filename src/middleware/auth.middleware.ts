// middleware/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";
import { Role } from "../models/User";

/* =========================================
   JWT PAYLOAD TYPE
========================================= */

export interface JwtPayload extends DefaultJwtPayload {
  id: string;
  role: Role;
  tenantId?: string | null;
  tenantSlug?: string | null; // 🔥 Added
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/* =========================================
   VERIFY TOKEN
========================================= */

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

/* =========================================
   ROLE BASED ACCESS
========================================= */

export const allowRoles = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};
