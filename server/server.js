const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const imageRoutes = require("./routes/imageRoutes");
const contactRoutes = require("./routes/contactRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const path = require("path"); // ✅ moved here

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// API routes
app.get("/api/test", (req, res) => {
  res.send("API working");
});

// Removed: Static route for uploads - images now served directly from Cloudinary

app.use("/api/images", imageRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/analytics", analyticsRoutes);

// ✅ STATIC + FRONTEND ROUTES (moved OUTSIDE)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// ✅ START SERVER (ONLY THIS SHOULD BE INSIDE)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
