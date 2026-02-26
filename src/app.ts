import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";

/* ROUTES */
import authRoutes from "./routes/auth.routes";
import superRoutes from "./routes/super.routes";
import adminRoutes from "./routes/admin.routes";
import personalRoutes from "./routes/personal.routes";
import socialRoutes from "./routes/social.routes";
import experienceRoutes from "./routes/experience.routes";
import contactRoutes from "./routes/contact.routes";
import publicRoutes from "./routes/public.routes";
import uploadRoutes from "./routes/upload.routes";

const app = express();

/* ================================
   GLOBAL MIDDLEWARE
================================ */

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
   ROUTES
================================ */

app.use("/api/auth", authRoutes);
app.use("/api/super", superRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/client/personal", personalRoutes);
app.use("/api/client/social", socialRoutes);
app.use("/api/client/experience", experienceRoutes);
app.use("/api/client/contact", contactRoutes);

app.use("/api/public", publicRoutes);
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
