const express = require("express");
const { register, login } = require("../controllers/authController");
const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log("Auth Route:", req.method, req.path);
  next();
});

// Auth routes
router.post("/register", register);
router.post("/login", login);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth route working" });
});

module.exports = router;
