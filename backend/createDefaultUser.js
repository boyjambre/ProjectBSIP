const mongoose = require("mongoose");
const User = require("./models/userModel");
require("dotenv").config();

async function createDefaultUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Cek apakah user admin sudah ada
    const existingUser = await User.findOne({ username: "admin" });
    if (existingUser) {
      console.log("User admin sudah ada");
      process.exit(0);
    }

    // Buat user admin baru
    const defaultUser = new User({
      username: "admin",
      password: "admin123", // akan di-hash otomatis oleh model
      role: "admin",
    });

    await defaultUser.save();
    console.log("User default berhasil dibuat:");
    console.log("Username: admin");
    console.log("Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createDefaultUser();
