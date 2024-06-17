const { body, query } = require("express-validator");

const MIN_PASS_LENGTH = 5;
const MAX_USERNAME_LENGTH = 25;

module.exports.email = body("email").isEmail().normalizeEmail();

module.exports.password = body("password")
	.trim()
	.escape()
	.isLength({ min: MIN_PASS_LENGTH });

module.exports.oldPassword = body("oldPassword").trim().escape();

module.exports.username = body("username")
	.trim()
	.toLowerCase()
	.isLength({ max: MAX_USERNAME_LENGTH })
	.matches("^[a-zA-Z0-9_]*$")
	.not()
	.isEmpty();

//query params
module.exports.emailQuery = query("email").normalizeEmail();

module.exports.usernameQuery = query("username").trim().toLowerCase();

module.exports.searchKeyword = query("keyword")
	.trim()
	.toLowerCase()
	.isLength({ max: MAX_USERNAME_LENGTH })
	.matches("^[a-zA-Z0-9_]*$")
	.not()
	.isEmpty();
