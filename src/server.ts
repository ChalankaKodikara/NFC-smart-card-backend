import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";
import seedSuperAdmin from "./utils/seedSuperAdmin";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();
    await seedSuperAdmin();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup Error:", error);
  }
};

startServer();
