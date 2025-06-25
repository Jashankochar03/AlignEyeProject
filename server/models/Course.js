const mongoose = require("mongoose");

const coursesSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseDescription: { type: String, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  benefitsOfCourse: { type: String },
  difficulty: {
    type: String,
    enum: ["Beginner", "Moderate", "Pro"],
    default : "Beginner"
  },
  genderSpecific: {
    type: String,
    enum: ["Male Only", "Female Only", "Both"],
    default : "Both"
  },
  price:{
    type:Number,
    default:0
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
  thumbnail: { type: String },
  exerciseCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExerciseCategory",
  },
  customersEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  ],
  instructions: {
    type: [String],
  },
  status: {
    type: String,
    enum: ["Draft", "Published"],
    default: "Draft",
    required: true,
  },
  totalDuration: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("Course", coursesSchema);
