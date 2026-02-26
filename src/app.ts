import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

/* ================================
   ROUTE IMPORTS
================================ */
import authRoutes from "./routes/auth.routes";
import superRoutes from "./routes/super.routes";
import adminRoutes from "./routes/admin.routes";
import personalRoutes from "./routes/personal.routes";
import socialRoutes from "./routes/social.routes";
import experienceRoutes from "./routes/experience.routes";
import contactRoutes from "./routes/contact.routes";
import publicRoutes from "./routes/public.routes";
import uploadRoutes from "./routes/upload.routes";

/* ================================
   CONFIG
================================ */
dotenv.config();

const app = express();

/* ================================
   GLOBAL MIDDLEWARE
================================ */

// ✅ CORS
app.use(
  cors({
    origin: "*", // 🔒 Change to frontend URL in production
    credentials: true,
  }),
);

// ✅ Body parser (Fix 413 issue)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Static Uploads Folder (ONLY ONCE)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ================================
   HEALTH CHECK
================================ */

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Casknet Portfolio API Running 🚀",
  });
});

/* ================================
   API ROUTES
================================ */

app.use("/api/auth", authRoutes);
app.use("/api/super", superRoutes);
app.use("/api/admin", adminRoutes);

// 🔥 Client Routes
app.use("/api/client/personal", personalRoutes);
app.use("/api/client/social", socialRoutes);
app.use("/api/client/experience", experienceRoutes);
app.use("/api/client/contact", contactRoutes);

// 🔥 Public Profile Route
app.use("/api/public", publicRoutes);
// 🔥 Upload Route
app.use("/api/upload", uploadRoutes);

/* ================================
   404 HANDLER
================================ */

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* ================================
   GLOBAL ERROR HANDLER
================================ */

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("🔥 Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
