import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { Message } from '../models/message.model';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private socket: Socket;
    newMessage = new Subject<{ msg: Message; receiver: string }>();

    constructor(private userService: UserService) {}

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

        this.socket.on('updateFriendRequests', (data) => {
            this.userService.getFriendRequestsFROM_DB()
        });

        this.socket.on('updateFriends', (data) => {
            this.userService.getFriendsFROM_DB()
        });
    }

    disconnect() {
        this.socket.disconnect();
    }
}
