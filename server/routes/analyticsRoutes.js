const express = require("express");
const Analytics = require("../models/Analytics");

const router = express.Router();

// Endpoint: /api/analytics/visit
// Method: POST
// Example usage: POST http://localhost:5000/api/analytics/visit
router.post("/visit", async (req, res) => {
  try {
    let analytics = await Analytics.findOne();

    if (!analytics) {
      analytics = new Analytics();
    }

    analytics.totalVisits += 1;
    await analytics.save();

    res.json({ totalVisits: analytics.totalVisits });
  } catch (error) {
    res.status(500).json({ message: "Failed to update visits" });
  }
});

// Endpoint: /api/analytics
// Method: GET
// Example usage: GET http://localhost:5000/api/analytics
router.get("/", async (req, res) => {
  try {
    let analytics = await Analytics.findOne();

    if (!analytics) {
      analytics = new Analytics();
      await analytics.save();
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics data" });
  }
});

module.exports = router;
