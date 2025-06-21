// Import the required modules
const express = require("express")
const router = express.Router()

// Import the Controllers

// Course Controllers Import
//const {
//  createDisease,
//  getAllDiseases,
//  getDiseaseDetails,
//} = require("../controllers/Disease")


// Categories Controllers Import
const {
    showAllBlogCategories,
    createBlogsCategory,
} = require("../controllers/BlogsCategory")



// Rating Controllers Import
//const {
//  createRating,
//  getAllRating,
//} = require("../controllers/RatingAndReviews")


// Importing Middlewares
const { auth, isEmployee, isCustomer, isAdmin } = require("../middlewares/auth")

// ********************************************************************************************************
//                                      Disease routes
// ********************************************************************************************************

// Diseases can only be registered by admin
//router.post("/createDisease", auth, isDoctor, createDisease)

// Get all Registered Diseases
//router.get("/getAllDiseases", getAllDiseases)
// Get Details for a Specific One
//router.get("/getDiseaseDetails", getDiseaseDetails)


// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", auth, isAdmin,createBlogsCategory)
router.get("/showAllCategories", showAllBlogCategories)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
//router.post("/createRating", auth, isPatient, createRating)
//router.get("/getReviews", getAllRating)

module.exports = router