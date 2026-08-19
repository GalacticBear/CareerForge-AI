const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CareerForge API is running",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`CareerForge API running on http://localhost:${PORT}`);
});