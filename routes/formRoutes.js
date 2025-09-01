const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// Schema yahin define kar diya
const formResponseSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const FormResponse = mongoose.model("FormResponse", formResponseSchema);

// Route
router.post("/submit", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const response = new FormResponse({ name, email, message });
    await response.save();
    res.status(201).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;  // 👈 CommonJS export