const amqp = require("amqplib/callback_api");
const socket = require('./socket')

let channel;
let queue;
const exchangeName = "chatExchange";

module.exports.init = (io) => {
	amqp.connect(`amqp://${process.env.RABBIT_URI}`, (err, connection) => {
		if (err) {
			throw err;
		}
		connection.createChannel((err, chn) => {
			if (err) {
				throw err;
			}
			console.log('connected to rabbit')
            channel = chn
			channel.assertExchange(exchangeName, "fanout", {
				durable: false,
			});

			channel.assertQueue("", { exclusive: true }, (err, q) => {
				if (err) {
					throw err;
				}

                channel = channel
				queue = q.queue;
				channel.bindQueue(queue, exchangeName, "");
				channel.consume(queue, (msg) => {
                    const data = JSON.parse(msg.content.toString())
                    const io = socket.getIO();
                    if (io) {
                        const con1ID = socket.getConnectionID(data.sender);
                        const con2ID = socket.getConnectionID(data.receiver);
            
                        if (con1ID) {
                        	//console.log("sending to user1");
                        	io.to(con1ID).emit("message", data);
                        }
                        if (con2ID) {
                        	//console.log("sending to user2");
                        	io.to(con2ID).emit("message", data);
                        }
                    }
                });
			});
		});
	});
};

module.exports.publishMessage = (msg) => {
    channel.publish(exchangeName, "", Buffer.from(JSON.stringify(msg)))
}
