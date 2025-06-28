// Import the required modules
const express = require("express")
const router = express.Router()

// Import the Controllers

// Course Controllers Import
const {
createCourse,
editCourse,
getAllCourses,
getCourseDetails,
getCreatorCourses,
getFullCourseDetails,
deleteCourse
} = require("../controllers/Exercise")


// Categories Controllers Import
const {
  showAllCategories,
  createCategory,
} = require("../controllers/ExerciseCategory")



// Rating Controllers Import
//const {
//  createRating,
//  getAllRating,
//} = require("../controllers/RatingAndReviews")


// Importing Middlewares
const { auth, isEmployee, isCustomer, isAdmin } = require("../middlewares/auth")

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

router.post("/createCourse", auth, isEmployee, createCourse)
router.put("/editCourse",auth,isEmployee,editCourse)
router.post('/getCourseDetails',getCourseDetails)
router.get('/getAllCourses',getAllCourses)
router.post('/getCreatorCourses',getCreatorCourses)
router.delete('/deleteCourse',auth,isEmployee,deleteCourse)
router.post("/getCourseFullDetail",auth,getFullCourseDetails)

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createExerciseCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
//router.post("/createRating", auth, isPatient, createRating)
//router.get("/getReviews", getAllRating)

module.exports = router