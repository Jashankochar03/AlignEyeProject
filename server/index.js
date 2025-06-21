const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const exerciseRoutes = require("./routes/Exercise")
const blogRoutes = require("./routes/Blogs")
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();
//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin:"http://localhost:3000",
		credentials:true,
	})
)

app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)
//cloudinary connection
//cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/exercise",exerciseRoutes);
app.use("/api/v1/blogs",blogRoutes);
//def route

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});

app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
})

