require("dotenv").config();
const express = require("express");
const validators = require("../util/validators");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const errorHelper = require("../util/error-helper");
const isAuth = require("../util/is-auth-middleware");
const mongoose = require("mongoose");
const router = express.Router();

//get friends
router.get("", isAuth, async (req, res, next) => {
	const userId = req.userId;

	try {
		const user = await User.findOne({ _id: userId })
			.populate("friends", ["username", "imagePath"])
			.exec();

		res.status(200).json({
			friends: user.friends,
		});
	} catch (err) {
		next(err);
	}
});

//add a friend
router.post("", isAuth, async (req, res, next) => {
	const userId = req.userId;
	const toAddUserId = req.body.toAddUserId;

	try {
		if (userId == toAddUserId) {
			throw errorHelper.createError("Can't add yourself", 400);
		}

		const user = await User.findOne({ _id: userId }).exec();
		const toAddUser = await User.findOne({ _id: toAddUserId }).exec();

		//const changed = false;
		if (!user.friends.includes(toAddUser._id)) {
			user.friends.push(toAddUser._id);
			await user.save();
			//	changed = true;
		}
		if (!toAddUser.friends.includes(user._id)) {
			toAddUser.friends.push(user._id);
			await toAddUser.save();
			//	changed = true;
		}

		res.status(201).json({
			message: "Successfully added as friends!",
		});
	} catch (err) {
		next(err);
	}
});

//delete a friend
router.delete("/:targetUserId", isAuth, async (req, res, next) => {
	const userId = req.userId;
	const toRemoveUserId = req.params.targetUserId;
	try {
		const user = await User.findOne({ _id: userId }).exec();
		const toRemoveUser = await User.findOne({ _id: toRemoveUserId }).exec();

		//const changed = false;
		if (user.friends.includes(toRemoveUser._id)) {
			const key = user.friends.indexOf(toRemoveUserId._id);
			user.friends.splice(key, 1);
			await user.save();
			//	changed = true;
		}
		if (toRemoveUser.friends.includes(user._id)) {
			const key = toRemoveUser.friends.indexOf(user._id);
			toRemoveUser.friends.splice(key, 1);
			await toRemoveUser.save();
			//	changed = true;
		}

		res.status(200).json({
			message: "Successfully unfriended both users",
		});
	} catch (err) {
		next(err);
	}
});

//get friend requests
router.get("/requests", isAuth, async (req, res, next) => {
	const userId = req.userId;

	try {
		const user = await User.findOne({ _id: userId })
			.populate("friendRequests", ["username", "imagePath"])
			.exec();

		res.status(200).json({
			requests: user.friendRequests,
		});
	} catch (err) {
		next(err);
	}
});

//send a friend request
router.post("/requests", isAuth, async (req, res, next) => {
	const userId = req.userId;
	const toSendUserId = req.body.toSendUserId;

	try {
		if (userId == toSendUserId) {
			throw errorHelper.createError("Can't add yourself", 400);
		}

		const user = await User.findOne({ _id: userId }).exec();
		const toSendUser = await User.findOne({ _id: toSendUserId }).exec();

		if (user.friends.includes(toSendUser._id) || toSendUser.friends.includes(user._id)) {
			throw errorHelper.createError("Already friends", 400);
		}

		if (toSendUser.friendRequests.includes(user._id)) {
			throw errorHelper.createError("Friend request already sent", 400);
		}

		toSendUser.friendRequests.push(user._id);
		await toSendUser.save();

		res.status(201).json({
			message: "Sent a friend request successfully",
		});
	} catch (err) {
		next(err);
	}
});

//reject a friend request
router.delete("/requests/:targetUserId", isAuth, async (req, res, next) => {
	const userId = req.userId;
	const toRejectUserId = req.params.targetUserId;

	try {
		const user = await User.findOne({ _id: userId }).exec();
		const toRejectUser = await User.findOne({ _id: toRejectUserId }).exec();

		if (!user.friendRequests.includes(toRejectUser._id)) {
			throw errorHelper.createError(
				"No friend request from such user",
				400
			);
		}

		const idx = user.friendRequests.indexOf(toRejectUser._id);
		user.friendRequests.splice(idx, 1);
		await user.save();

		res.status(200).json({
			message: "Successfully rejected friend request",
		});
	} catch (err) {
		next(err);
	}
});

//search for people
router.get("/search", [validators.searchKeyword], async (req, res, next) => {
	const keyword = req.query.keyword;
	const skip = req.query.skip;
	const limit = req.query.limit;

	try {
		if (!validationResult(req).isEmpty()) {
			throw errorHelper.createError("invalid input data", 400);
		}

		const search = keyword
			? { username: { $regex: new RegExp(keyword, "i") } }
			: {};

		const count = await User.countDocuments(search).exec();
		const result = await User.find(search)
			.sort()
			.skip(skip)
			.limit(limit)
			.exec();

		res.status(200).json({
			total: count,
			users: result,
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
