const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  blogName: { type: String, required: true },
  blogDescription: { type: String, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  blogData: { type: String },

  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
  thumbnail: { type: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogsCategory",
    required: true,
  },

  customersViewed: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  ],
  blogImages: {
    type: [String],
  },
  status: {
    type: String,
    enum: ["Draft", "Published"],
    default: "Draft",
    required: true,
  },

}, { timestamps: true });

module.exports = mongoose.model("Blog", blogSchema);
