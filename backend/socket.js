require("dotenv").config();

const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
const cons = {};
let io;

module.exports.init = (server) => {
	io = socketio(server, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
	});

	io.on("connection", (con) => {
		let decoded;
		try {
			const token = con.handshake.auth.token;
			decoded = jwt.verify(token, process.env.JWT_KEY);
		} catch (err) {
			console.log(err);
		}

		if (!decoded) return;
		const userId = decoded.userId;
		con.data.userId = userId;
		cons[userId] = con.id;
		//console.log("user connected", userId);

		con.on("disconnect", () => {
			//console.log("user disconnected", userId)
			for (let userId in cons) {
				if (cons[userId] === con.id) {
					delete cons[userId];
					break;
				}
			}
		});
	});

	return io;
};

module.exports.getIO = () => {
	return io;
};

module.exports.getConnectionID = (userId) => {
	return cons[userId];
};
