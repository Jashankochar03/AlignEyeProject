const mongoose = require("mongoose");

const blogsCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: { type: String },
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blogs",
        },
    ],
});


module.exports = mongoose.model("BlogsCategory", blogsCategorySchema);