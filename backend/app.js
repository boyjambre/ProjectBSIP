const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const iklimRoutes = require("./routes/iklimRoutes");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Koneksi ke MongoDB menggunakan URI dari .env
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/iklim", iklimRoutes);

// Create uploads directory if it doesn't exist
const fs = require("fs");
const path = require("path");
const uploadDir = path.join(__dirname, "file");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`App running on port ${port}`));
