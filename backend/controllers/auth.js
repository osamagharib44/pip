const express = require("express");
const { validationResult } = require("express-validator");
const validators = require("../util/validators");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const errorHelper = require("../util/error-helper");
const jwt = require("jsonwebtoken");
const isAuth = require("../util/is-auth-middleware");
const fs = require('fs'); 
const util = require('util');
const deleteFile = util.promisify(fs.unlink); 

const CRYPT_SALT = 12;
const EXPIRE_TIME = 3600; //hour

const router = express.Router();

//check whether email OR username is taken before
router.get(
	"/valid",
	[validators.usernameQuery, validators.emailQuery],
	async (req, res, next) => {
		const email = req.query.email;
		const username = req.query.username;

		try {
			if (!email && !username) {
				throw errorHelper.createError("Empty query", 401);
			}

			const userDoc = await User.findOne({
				$or: [{ username: username }, { email: email }],
			}).exec();

			res.status(200).json({
				valid: userDoc ? false : true,
			});
		} catch (error) {
			next(error);
		}
	}
);

//sign up
router.post(
	"/signup",
	[validators.email, validators.password, validators.username],
	async (req, res, next) => {
		const username = req.body.username;
		const email = req.body.email;
		const password = req.body.password;
		try {
			if (!validationResult(req).isEmpty()) {
				throw errorHelper.createError("invalid input data", 400);
			}

			const userDoc1 = await User.findOne({ email: email }).exec();
			const userDoc2 = await User.findOne({ username: username }).exec();

			if (userDoc1 || userDoc2) {
				throw errorHelper.createError(
					"Username or email already exists",
					400
				);
			}

			const hashPassword = await bcrypt.hash(password, CRYPT_SALT);
			const user = new User({
				username: username,
				password: hashPassword,
				email: email,
			});

			await user.save();

			res.status(201).json({
				message: "Created :D",
			});
		} catch (error) {
			next(error);
		}
	}
);

//edit account
router.put(
	"/update",
	[isAuth ,validators.password, validators.oldPassword, validators.username],
	async (req, res, next) => {
		const userId = req.userId
		const newUsername = req.body.username;
		const oldPassword = req.body.oldPassword
		const newPassword = req.body.password;
		const newImage = req.file
		try {
			if (!validationResult(req).isEmpty()) {
				throw errorHelper.createError("invalid input data", 400);
			}

			const user = await User.findOne({ _id: userId }).exec();
			const userDocCheck = await User.findOne({ username: newUsername }).exec();

			if (newUsername!=user.username && userDocCheck) {
				throw errorHelper.createError(
					"Username already exists",
					400
				);
			}

			const eq = await bcrypt.compare(oldPassword, user.password);
			
			if (!eq){
				throw errorHelper.createError(
					"Incorrect password",
					400
				);			
			}

			const hashNewPassword = await bcrypt.hash(newPassword, CRYPT_SALT);
			user.password = hashNewPassword
			user.username = newUsername
			if (newImage){
				if (user.imagePath!="images/default.png"){
					try {
						await deleteFile(user.imagePath)
					}
					catch (err) {
						console.log(err)
					}
				}
				user.imagePath = newImage.path
			}
			await user.save()
			res.status(200).json({message: "Updated profile", newImagePath: user.imagePath})

		} catch (error) {
			try {
				await deleteFile(newImage.path)
			}
			catch (err) {
				console.log(err)
			}
			next(error);
		}
	}
);

//sign in
router.post(
	"/signin",
	[validators.username, validators.password],
	async (req, res, next) => {
		const username = req.body.username;
		const password = req.body.password;

		try {
			if (!validationResult(req).isEmpty()) {
				throw errorHelper.createError("invalid input data", 400);
			}

			const userDoc = await User.findOne({ username: username });

			if (userDoc) {
				const eq = await bcrypt.compare(password, userDoc.password);
				if (!eq) {
					throw errorHelper.createError(
						"Invalid username or password",
						400
					);
				}
			} else {
				throw errorHelper.createError(
					"Invalid username or password",
					400
				);
			}

			const token = jwt.sign(
				{
					userId: userDoc._id,
				},
				process.env.JWT_KEY,
				{ expiresIn: EXPIRE_TIME }
			);

			res.status(200).json({
				userId: userDoc._id,
				username: userDoc.username,
				email: userDoc.email,
				imagePath: userDoc.imagePath,
				token: token,
				expiration: new Date(Date.now() + EXPIRE_TIME * 1000),
			});
		} catch (error) {
			next(error);
		}
	}
);

module.exports = router;
