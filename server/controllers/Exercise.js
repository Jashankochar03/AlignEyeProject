const Course = require("../models/Course")
const ExerciseCategory = require("../models/ExerciseCategory")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const User = require("../models/User")
const { uploadImageToS3 } = require("../utils/imageUploaderS3")
const {convertSecondsToDuration} = require("../utils/secToDuration")
// Function to create a new course
exports.createCourse = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id

    // Get all required fields from request body
    let {
      courseName,
      courseDescription,
      benefitsOfCourse,
      exerciseCategory,
      status,
      price,
      difficulty,
      genderSpecific
    } = req.body
    // Get thumbnail image from request files
    const thumbnail = req.files.thumbnailImage

    // Check if any of the required fields are missing
    if (
      !courseName ||
      !courseDescription ||
      !thumbnail ||
      !exerciseCategory
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      })
    }
    if (!status || status === undefined) {
      status = "Draft"
    }
    // Check if the user is an instructor
    const creatorDetails = await User.findById(userId, {
      accountType: "Employee",
    })

    if (!creatorDetails) {
      return res.status(404).json({
        success: false,
        message: "Creator Details Not Found",
      })
    }

    // Check if the tag given is valid
    const categoryDetails = await ExerciseCategory.findById(exerciseCategory)
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details Not Found",
      })
    }
    // Upload the Thumbnail to Cloudinary
      const thumbnailImage = await uploadImageToS3(
        thumbnail,
        process.env.FOLDER_NAME
      )
    console.log(thumbnailImage)
    // Create a new course with the given details
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      creator: creatorDetails._id,
      benefitsOfCourse: benefitsOfCourse,
      price,
      difficulty,
      genderSpecific,
      exerciseCategory: categoryDetails._id,
      thumbnail: thumbnailImage.Location,
      status: status
    })

    // Add the new course to the User Schema of the Instructor
    await User.findByIdAndUpdate(
      {
        _id: creatorDetails._id,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    )
    // Add the new course to the Categories
    const categoryDetails2 = await ExerciseCategory.findByIdAndUpdate(
      { _id: exerciseCategory },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    )
    console.log("HEREEEEEEEE", categoryDetails2)
    // Return the new course and a success message
    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    })
  } catch (error) {
    // Handle any errors that occur during the creation of the course
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    })
  }
}

exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const updates = req.body
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToS3(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.Location
    }

    // Update only the fields that are present in the request body
    const allowedUpdates = [
      "courseName",
      "courseDescription",
      "benefitsOfCourse",
      "price",
      "difficulty",
      "genderSpecific",
      "status",
      "exerciseCategory"
    ]

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        course[field] = updates[field]
      }
    })

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "creator",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("exerciseCategory")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        difficulty:true,
        genderSpecific:true,
        exerciseCategory:true,
        thumbnail: true,
        creator: true,
        ratingAndReviews: true,
        customersEnrolled: true,
      }
    )
      .populate("creator")
      .populate({
      path: "exerciseCategory",
      select: "name"
      })
      .exec()


    return res.status(200).json({
      success: true,
      data: allCourses,
    })
  } catch (error) {
    console.log(error)
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    })
  }
}

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "creator",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("exerciseCategory")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "creator",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("exerciseCategory")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    console.log("courseProgressCount : ", courseProgressCount)

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    let totalVideos = 0;
    courseDetails.courseContent.forEach((section) => {
      totalVideos += section.subSection.length;
    });

    const completedVideos = courseProgressCount?.completedVideos || [];
    const completedCount = completedVideos.length;
    const progressPercentage =
    totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: completedCount,
        progressPercentage: progressPercentage
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getCreatorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const creatorId = req.user.id

    // Find all courses belonging to the instructor
    const creatorCourses = await Course.find({
      creator: creatorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: creatorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll customers from the course
    const customersEnrolled = course.customersEnrolled
    for (const customerId of customersEnrolled) {
      await User.findByIdAndUpdate(customerId, {
        $pull: { courses: courseId },
      })
    }
    //deletion from exerciseCategory
    await ExerciseCategory.findByIdAndUpdate(course.exerciseCategory, {
      $pull: { courses: courseId },
    });

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}