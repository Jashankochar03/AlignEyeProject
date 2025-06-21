const { Mongoose } = require("mongoose");
const BlogsCategory = require("../models/BlogsCategory");


exports.createBlogsCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !description) {
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" });
        }
        const blogDetails = await BlogsCategory.create({
            name: name,
            description: description,
        });
        return res.status(200).json({
            success: true,
            blogDetails,
            message: "Category Created Successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.showAllBlogCategories = async (req, res) => {
    try {
        console.log("INSIDE SHOW ALL CATEGORIES");
        const allCategorys = await BlogsCategory.find({});
        res.status(200).json({
            success: true,
            data: allCategorys,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//categoryPageDetails 

exports.blogCategoryPageDetails = async (req, res) => {
    try {
      const { categoryId } = req.body
      console.log("PRINTING CATEGORY ID: ", categoryId);
      
      const selectedCategory = await BlogsCategory.findById(categoryId)
        .populate({
          path: "blogs",
          match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec()
  
      
      if (!selectedCategory) {
        console.log("Category not found.")
        return res
          .status(404)
          .json({ success: false, message: "Category not found" })
      }
      
      if (selectedCategory.blogs.length === 0) {
        console.log("No courses found for the selected category.")
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        })
      }
      return res.status(200).json({
        success:true,
        selectedCategory,
        message : "Category detail fetched successfully"
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
   }