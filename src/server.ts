import dotenv from "dotenv";
dotenv.config(); // 🔥 MUST BE FIRST

import app from "./app";
import connectDB from "./config/db";   // ✅ NO {}
import seedSuperAdmin from "./utils/seedSuperAdmin";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // ✅ Connect Database FIRST
    await connectDB();
    console.log("✅ Database Connected");

    // ✅ Seed super admin AFTER DB connect
    await seedSuperAdmin();

    // ✅ Start Express
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Startup Error:", error);
    process.exit(1); // 🔥 stop app if DB fails
  }
};

startServer();
