
const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
const cons = {};
let nsp;

module.exports.init = (server, ROOT_PATH) => {
	const io = socketio(server, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
	});
	if (ROOT_PATH==''){
		ROOT_PATH='/'
	}
	console.log(ROOT_PATH)
	nsp = io.of(ROOT_PATH);

	nsp.on("connection", (con) => {
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
		console.log(userId)
		cons[userId] = con.id;
		//console.log("user connected", userId);

		con.on("disconnect", () => {
			//console.log("user disconnected", userId)
			for (let userId in cons) {
				if (cons[userId] === con.id) {
					delete cons[userId];
					console.log("DISCONNECTED:" + userId)
					break;
				}
			}
		});
	});

	return nsp;
};

module.exports.getIO = () => {
	return nsp;
};

module.exports.getConnectionID = (userId) => {
	return cons[userId];
};
