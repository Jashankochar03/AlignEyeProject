// Import the required modules
const express = require("express")
const router = express.Router()

// Import the Controllers

// Blogs Controllers Import
const {
  createBlog,
  editBlog,
  getBlogDetails,
  getAllBlogs,
  getCreatorBlogs,
  deleteBlog
} = require("../controllers/Blogs")


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

// Blogs can only be registered by employee
router.post("/createBlog", auth, isEmployee, createBlog)
router.put("/editBlog",auth,isEmployee,editBlog)
router.post('/getBlogDetails',getBlogDetails)
router.get('/getAllBlogs',getAllBlogs)
router.post('/getCreatorBlogs',getCreatorBlogs)
router.delete('/deleteBlog',auth,isEmployee,deleteBlog)
// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Employee
// TODO: Put IsEmployee Middleware here
router.post("/createCategory", auth, isEmployee,createBlogsCategory)
router.get("/showAllCategories", showAllBlogCategories)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
//router.post("/createRating", auth, isPatient, createRating)
//router.get("/getReviews", getAllRating)

module.exports = router