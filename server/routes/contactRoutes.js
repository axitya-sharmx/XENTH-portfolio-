const express = require("express");
const Contact = require("../models/Contact");

const router = express.Router();

// Endpoint: /api/contact
// Method: POST
// Example usage: POST http://localhost:5000/api/contact with JSON { "name": "John Doe", "email": "john@example.com", "message": "Hello" }
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const newContact = new Contact({
      name,
      email,
      message,
    });

    await newContact.save();

    res.status(201).json({ message: "Contact form submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit contact form" });
  }
});

module.exports = router;
