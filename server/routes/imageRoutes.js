const express = require("express");
const Image = require("../models/Image");
const Analytics = require("../models/Analytics");

const router = express.Router();

// ✅ GET images
router.get("/", async (req, res) => {
  try {
    const images = await Image.find();
    console.log(images);
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch images" });
  }
});

// 🔥 ADD THIS (POST)
router.post("/", async (req, res) => {
  try {
    const newImage = new Image({
      url: req.body.url
    });

    await newImage.save();

    res.status(201).json(newImage);
  } catch (error) {
    res.status(500).json({ message: "Failed to add image" });
  }
});

// Endpoint: /api/images/like/:id
// Method: POST
// Example usage: POST http://localhost:5000/api/images/like/680000000000000000000000
router.post("/like/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    image.likes += 1;
    await image.save();

    let analytics = await Analytics.findOne();
    if (!analytics) {
      analytics = new Analytics();
    }
    analytics.totalLikes += 1;
    await analytics.save();

    return res.json({ likes: image.likes });
  } catch (error) {
    return res.status(500).json({ message: "Failed to like image" });
  }
});

module.exports = router;
