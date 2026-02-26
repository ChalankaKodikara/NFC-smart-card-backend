import bcrypt from "bcryptjs";
import User from "../models/User";

const seedSuperAdmin = async () => {
  const existing = await User.findOne({ role: "SUPER_ADMIN" });
  if (existing) {
    console.log("Super Admin already exists");
    return;
  }

  const hashed = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD!, 10);

  await User.create({
    username: process.env.SUPER_ADMIN_USERNAME,
    email: "admin@casknet.com",
    password: hashed,
    role: "SUPER_ADMIN",
  });

  console.log("Super Admin created successfully");
};

export default seedSuperAdmin;
