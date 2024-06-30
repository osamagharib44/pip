const express = require("express");
const validators = require("../util/validators");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const Chat = require("../models/chat");
const Message = require("../models/message");
const errorHelper = require("../util/error-helper");
const isAuth = require("../util/is-auth-middleware");
const mongoose = require("mongoose");
const router = express.Router();
const rabbit = require("../rabbit");

//get activity of a chat
router.get("/activity", isAuth, async (req, res, next) => {
	const user1_Id = req.userId;
	try {
		let chatsActivity = await Chat.find({
			$or: [{ recipient1: user1_Id }, { recipient2: user1_Id }],
		})
			.populate("lastMessage")
			.select("pairId lastMessage seen")
			.exec();

		res.status(200).json({
			activites: chatsActivity,
		});
	} catch (err) {
		next(err);
	}
});

//set seen to true
router.put("/activity/:userId", isAuth, async (req, res, next) => {
	const user1_Id = req.userId;
	const user2_Id = req.params.userId;
	const pairId =
		user1_Id < user2_Id ? user1_Id + user2_Id : user2_Id + user1_Id;
	try {
		if (!mongoose.Types.ObjectId.isValid(user2_Id)) {
			return res.status(400).send("Invalid input data");
		}
		let chat = await Chat.findOne({ pairId: pairId })
			.populate("lastMessage")
			.exec();

		if (chat) {
			if (chat.lastMessage && chat.lastMessage.sender != user1_Id) {
				chat.seen = true;
				await chat.save();
			}
		}

		res.status(200).json({
			message: "Successfully seen new messages",
		});
	} catch (err) {
		next(err);
	}
});

//get messages of a chat
router.get("/:userId", isAuth, async (req, res, next) => {
	const user1_Id = req.userId;
	const user2_Id = req.params.userId;
	const skip = req.query.skip;
	const limit = req.query.limit;
	const pairId =
		user1_Id < user2_Id ? user1_Id + user2_Id : user2_Id + user1_Id;

	try {
		if (!mongoose.Types.ObjectId.isValid(user2_Id)) {
			return res.status(400).send("Invalid input data");
		}
		let chat = await Chat.findOne({ pairId: pairId }).exec();

		if (!chat) {
			return res.status(200).json({
				messages: [],
			});
		} else {
			const chatId = chat._id;
			const sortedMessageIds = await Message.find({
				_id: { $in: chat.messages },
			})
				.sort({ timestamp: 1 })
				.skip(skip)
				.limit(limit)
				.select("_id")
				.exec();

			// Populate the selected message IDs
			const populatedChat = await Chat.findById(chatId)
				.populate({
					path: "messages",
					match: {
						_id: { $in: sortedMessageIds.map((msg) => msg._id) },
					},
					options: { sort: { timestamp: 1 } },
					select: "content sender timestamp",
				})
				.exec();

			return res.status(200).json({
				messages: populatedChat.messages,
			});
		}
	} catch (err) {
		next(err);
	}
});

//send message
router.post("/:userId", isAuth, async (req, res, next) => {
	const user1_Id = req.userId;
	const user2_Id = req.params.userId;
	const pairId =
		user1_Id < user2_Id ? user1_Id + user2_Id : user2_Id + user1_Id;

	const content = req.body.message;
	try {
		if (!mongoose.Types.ObjectId.isValid(user2_Id)) {
			return res.status(400).send("Invalid input data");
		}
		if (content.length > 250) {
			throw errorHelper.createError("Message is too long", 400);
		}
		const user1_doc = await User.findOne({ _id: user1_Id }).exec();

		if (!user1_doc.friends.includes(user2_Id)) {
			throw errorHelper.createError("Not friends", 400);
		}

		let chat = await Chat.findOne({ pairId: pairId }).exec();
		if (!chat) {
			chat = new Chat({
				pairId: pairId,
				messages: [],
				recipient1: user1_Id,
				recipient2: user2_Id,
				lastMessage: null,
			});
		}

		const msg = new Message({
			content: content,
			sender: user1_Id,
		});
		const msgDoc = await msg.save();

		chat.messages.push(msgDoc);
		chat.lastMessage = msgDoc._id;
		chat.seen = false;
		await chat.save();

		const data = {
			sender: user1_Id,
			receiver: user2_Id,
			content: content,
			timestamp: msg.timestamp,
		};

		rabbit.publishMessage(data);

		res.status(201).json({
			message: "Sucessfully sent message",
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;
