//main
require("dotenv").config();
const path = require('path')
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require('multer')
const cors = require("cors");
const socket = require('./socket')
const rabbit = require('./rabbit')
//routes
const authRoutes = require("./controllers/auth");
const friendsRoutes = require("./controllers/friends");
const chatsRoutes = require("./controllers/chats");

//some file upload config
const fileStorage = multer.diskStorage({
	destination:(req, file, cb) => {
		cb(null, 'images')
	},
	filename: (req, file, cb) => {
		cb(null, new Date().toISOString() + '-' + file.originalname)
	}
})

const fileFilter = (req, file ,cb) => {
	if (file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg"){
		cb(null, true)		
	}
	else {
		cb(null, false)
	}
}

//middlewares
const app = express();
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use(bodyParser.json());
app.use(cors());

//use the routes
app.use("/auth", authRoutes);
app.use("/friends", friendsRoutes);
app.use("/chats", chatsRoutes);

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
		`mongodb://${process.env.DB_URI}`
	)
	.then((result) => {
		console.log("connected to db");
		const server = app.listen(process.env.PORT);

		socket.init(server)
		rabbit.init()
	})
	.catch((err) => console.log(err));
