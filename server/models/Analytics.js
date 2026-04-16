const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  totalVisits: {
    type: Number,
    default: 0,
  },
  totalLikes: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Analytics", analyticsSchema);
