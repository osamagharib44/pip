//main
require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const socket = require("./socket");
const rabbit = require("./rabbit");
const fileType = require("file-type");
let ROOT_PATH = process.env.ROOT_PATH
if (!ROOT_PATH){
	ROOT_PATH = ''
}
//routes
const authRoutes = require("./controllers/auth");
const friendsRoutes = require("./controllers/friends");
const chatsRoutes = require("./controllers/chats");

//some file upload config
const fileStorage = multer.memoryStorage();

const fileFilter = async (req, file, cb) => {
	if (
		file.mimetype == "image/png" ||
		file.mimetype == "image/jpeg" ||
		file.mimetype == "image/jpg"
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

//middlewares
const app = express();
app.get(ROOT_PATH+"/images/default.png", (req, res) => {
	res.sendFile(path.join(__dirname, "default.png"));
});
app.use(ROOT_PATH+"/images", express.static(path.join(__dirname, "images")));
app.use(
	multer({
		storage: fileStorage,
		fileFilter: fileFilter,
		limits: { fileSize: 1000000 },
	}).single("image")
);
app.use(bodyParser.json());
app.use(cors());

//use the routes
app.use(ROOT_PATH+"/auth", authRoutes);
app.use(ROOT_PATH+"/friends", friendsRoutes);
app.use(ROOT_PATH+"/chats", chatsRoutes);

//error middleware
app.use(async (err, req, res, next) => {
	console.log(err);

	if (err.isTrusted) {
		res.status(err.status).json({
			errorMessage: err.message,
		});
	} else {
		res.status(err.status || 500).json({
			errorMessage: "Some error occured, check on server",
		});
	}
});

//init
mongoose
	.connect(
		`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
	)
	.then((result) => {
		console.log("connected to db");
		const server = app.listen(process.env.PORT);

		socket.init(server, ROOT_PATH);
		rabbit.init();
	})
	.catch((err) => console.log(err));
