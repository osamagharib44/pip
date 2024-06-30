const amqp = require("amqplib/callback_api");
const socket = require('./socket')

let channel;
const chatExchange = "chatExchange";
const friendsExchange = "friendsExchange"

module.exports.init = (io) => {
	amqp.connect(`amqp://${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`, (err, connection) => {
		if (err) {
			throw err;
		}
		connection.createChannel((err, chn) => {
			if (err) {
				throw err;
			}
			console.log('connected to rabbit')
            channel = chn
		
			//assert all exchanges
			channel.assertExchange(chatExchange, "fanout", {
				durable: false,
			});

			channel.assertExchange(friendsExchange, "fanout", {
				durable: false,
			});

			//consumer for chat
			channel.assertQueue("", { exclusive: true }, (err, q) => {
				if (err) {
					throw err;
				}
				const queue = q.queue;
				channel.bindQueue(queue, chatExchange, "");
				channel.consume(queue, (msg) => {
                    const data = JSON.parse(msg.content.toString())
                    const io = socket.getIO();
                    if (io) {
                        const con1ID = socket.getConnectionID(data.sender);
                        const con2ID = socket.getConnectionID(data.receiver);
						console.log("RECIEVED MSG")

                        if (con1ID) {
                        	console.log("sending to user1");
                        	io.to(con1ID).emit("message", data);
                        }
                        if (con2ID) {
                        	console.log("sending to user2");
                        	io.to(con2ID).emit("message", data);
                        }
                    }
                });
			});

			//consumer for friends/requests update
			channel.assertQueue("", { exclusive: true }, (err, q) => {
				if (err) {
					throw err;
				}
				const queue = q.queue;
				channel.bindQueue(queue, friendsExchange, "");
				channel.consume(queue, (msg) => {
                    const data = JSON.parse(msg.content.toString())
                    const io = socket.getIO();
                    if (io) {
						const type = data.type //updateFriendRequests or updateFriends
                        const conID = socket.getConnectionID(data.user);
            
                        if (conID) {
                        	io.to(conID).emit(type);
                        }
                    }
                });
			});
		});
	});
};

module.exports.publishMessage = (msg) => {
	console.log("SENT MSG")
    channel.publish(chatExchange, "", Buffer.from(JSON.stringify(msg)))
}

module.exports.publishFriendsUpdate = (msg) => {
    channel.publish(friendsExchange, "", Buffer.from(JSON.stringify(msg)))
}