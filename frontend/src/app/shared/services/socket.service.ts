import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { Message } from '../models/message.model';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private socket: Socket;
    newMessage = new Subject<{ msg: Message; receiver: string }>();

    constructor() {}

    connect(token: string) {
        this.socket = io(environment.backend_endpoint, {
            auth: {
                token: token,
            },
        });

        this.socket.on('message', (data) => {
            const msg = new Message(data.sender, data.content, new Date(data.timestamp));
            this.newMessage.next({ msg: msg, receiver: data.receiver });
        });
    }

    disconnect() {
        this.socket.disconnect();
    }
}
