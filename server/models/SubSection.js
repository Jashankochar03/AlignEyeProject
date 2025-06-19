const mongoose = require("mongoose");

const SubSectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  durationInSeconds: { type: Number, default: 0 },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("SubSection", SubSectionSchema);
