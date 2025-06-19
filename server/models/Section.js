const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
    required: true,
    trim: true
  },
  subSection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SubSection", // likely an Exercise model or Video model
    },
  ],
  totalDuration: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("Section", sectionSchema);
