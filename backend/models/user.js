const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},

	password: {
		type: String,
		required: true,
	},

	email: {
		type: String,
		required: true,
		unique: true
	},

    imagePath: {
        type: String,
        default: "images/default.png",
    },

	friends: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	],

    friendRequests: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	],

});

module.exports = mongoose.model("User", userSchema);
