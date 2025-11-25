const express = require("express");
const path = require("path");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    url: fileUrl,
    fileName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });
});

module.exports = router;

