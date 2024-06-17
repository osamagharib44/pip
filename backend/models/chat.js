const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
	pairId: {
		type: String,
		required: true,
		unique: true,
	},
	recipient1: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
	recipient2: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
	seen: { type: mongoose.Schema.Types.Boolean, default: false },
	messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
	lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
});

module.exports = mongoose.model("Chat", chatSchema);
