const Blogs = require("../models/Blogs")
const BlogsCategory = require("../models/BlogsCategory")
const User = require("../models/User")
const { uploadImageToS3 } = require("../utils/imageUploaderS3")
// Function to create a new course
exports.createBlog = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id

    // Get all required fields from request body
    let {
      blogName,
      blogDescription,
      category,
      blogData,
      status
    } = req.body
    // Get thumbnail image from request files
    const thumbnail = req.files.thumbnailImage
    // Check if any of the required fields are missing
    if (
      !blogName ||
      !blogDescription ||
      !thumbnail ||
      !blogData ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      })
    }
    if (!status || status === undefined) {
      status = "Draft"
    }
    // Check if the user is an employee
    const creatorDetails = await User.findOne({
        _id: userId,
        accountType: "Employee",
        })


    if (!creatorDetails) {
      return res.status(404).json({
        success: false,
        message: "Creator Details Not Found",
      })
    }

    // Check if the tag given is valid
    const categoryDetails = await BlogsCategory.findById(category)
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details Not Found",
      })
    }
    // Upload the Thumbnail to AWS S3
    const thumbnailImage = await uploadImageToS3(
        thumbnail,
        process.env.FOLDER_NAME
      )
    console.log(thumbnailImage)
    // Create a new course with the given details
    const newBlog = await Blogs.create({
      blogName,
      blogDescription,
      blogData,
      creator: creatorDetails._id,
      category: categoryDetails._id,
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
          blogs: newBlog._id,
        },
      },
      { new: true }
    )
    // Add the new course to the Categories
    const categoryDetails2 = await BlogsCategory.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          blogs: newBlog._id,
        },
      },
      { new: true }
    )
    console.log("HEREEEEEEEE", categoryDetails2)
    // Return the new course and a success message
    res.status(200).json({
      success: true,
      data: newBlog,
      message: "Blog created Successfully",
    })
  } catch (error) {
    // Handle any errors that occur during the creation of the course
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to create blog",
      error: error.message,
    })
  }
}

exports.editBlog = async (req, res) => {
  try {
    const { blogId } = req.body
    const updates = req.body
    const blog = await Blogs.findById(blogId)

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" })
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToS3(
        thumbnail,
        process.env.FOLDER_NAME
      )
      blog.thumbnail = thumbnailImage.Location
    }

    // Update only the fields that are present in the request body
    const allowedUpdates = [
      "blogName",
      "blogData",
      "blogDescription",
      "status",
      "category"
    ]

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        blog[field] = updates[field]
      }
    })

    await blog.save()

    const updatedBlog = await Blogs.findOne({
      _id: blogId,
    })
      .populate({
        path: "creator",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .exec()

    res.json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
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

exports.getAllBlogs = async (req, res) => {
  try {
    const allBlogs = await Blogs.find(
      { status: "Published" },
      {
        blogName: true,
        category:true,
        thumbnail: true,
        creator: true,
        ratingAndReviews: true,
        customersViewed: true,
      }
    )
      .populate({
        path: "creator",
        select: "firstName lastName email image",
    })
      .populate({
      path: "category",
      select: "name"
      })
      .exec()


    return res.status(200).json({
      success: true,
      data: allBlogs,
    })
  } catch (error) {
    console.log(error)
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Blogs Data`,
      error: error.message,
    })
  }
}

exports.getBlogDetails = async (req, res) => {
  try {
    const { blogId } = req.body
    const blogDetails = await Blogs.findOne({
      _id: blogId,
    })
      .populate({
        path: "creator",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .exec()

    if (!blogDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find blog with id: ${blogId}`,
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        blogDetails
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getCreatorBlogs = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const creatorId = req.user.id

    // Find all courses belonging to the instructor
    const creatorBlogs = await Blogs.find({
      creator: creatorId,
    }).sort({ createdAt: -1 })

    // Return the creator's blogs
    res.status(200).json({
      success: true,
      data: creatorBlogs,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve creator blogs",
      error: error.message,
    })
  }
}
// Delete the Course
exports.deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.body

    // Find the course
    const blog = await Blogs.findById(blogId)
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" })
    }

    await User.findByIdAndUpdate(blog.creator, {
    $pull: { blogs: blogId },
    });

    //deletion from BlogsCategory
    await BlogsCategory.findByIdAndUpdate(blog.category, {
      $pull: { blogs: blogId },
    });


    // Delete the course
    await Blogs.findByIdAndDelete(blogId)

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
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