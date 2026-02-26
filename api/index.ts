import app from "../src/app";
import { connectDB } from "../src/config/db";

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("🔥 Function Crash:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}