const express = require("express")
const router = express.Router()
const { auth, isEmployee } = require("../middlewares/auth")
const {

  updateProfile,
} = require("../controllers/Profile")

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

router.put("/updateProfile", auth, updateProfile)


module.exports = router