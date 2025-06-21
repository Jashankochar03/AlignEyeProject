// Import the required modules
const express = require("express")
const router = express.Router()

// Import the required controllers and middleware functions
const {
  login,
  signup,
  sendotp,
  googleAuth
} = require("../controllers/Auth")
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword")

const { auth } = require("../middlewares/auth")

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************
const passport = require("passport");


// Step 1: Redirect to Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Step 2: Handle callback
router.get(
  "/google/signup",
  passport.authenticate("google", {
    session: false,                  // ✅ You're not using sessions
    failureRedirect: "/login",       // Optional: can redirect on failure
  }),
  googleAuth                  // ✅ Handles token generation and DB ops
);



// Route for user login
router.post("/login", login)

// Route for user signup
router.post("/signup", signup)

// Route for sending OTP to the user's email
router.post("/sendotp", sendotp)


// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword)

// Export the router for use in the main application
module.exports = router