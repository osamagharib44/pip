import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { SocketService } from './socket.service';
import { last, map, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserMini } from '../models/user-mini.model';
import { Message } from '../models/message.model';

interface messageHttpResponse {
    _id: string;
    sender: string;
    content: string;
    timestamp: Date;
}

@Injectable({
    providedIn: 'root',
})
export class ChatsService {
    activites = new Map<string, { seen: boolean; last: Date }>();

    constructor(
        private http: HttpClient,
        private userService: UserService,
        private socketService: SocketService
    ) {}

    get me() {
        return this.userService.user.value;
    }

    get friends() {
        return this.userService.user.value.friends;
    }


    getChatActivies() {
        return this.http
            .get<{
                activites: {
                    seen: boolean;
                    pairId: string;
                    lastMessage: messageHttpResponse;
                }[];
            }>(environment.backend_endpoint + '/chats/activity')
            .pipe(
                tap((res) => {
                    res.activites.forEach((item) => {
                        const user1 = item.pairId.substring(
                            0,
                            item.pairId.length / 2
                        );
                        const user2 = item.pairId.substring(
                            item.pairId.length / 2
                        );
                        const recipient = this.me.id == user1 ? user2 : user1;
                        let seen = true
                        if (item.lastMessage.sender == recipient){
                          seen = item.seen
                        }
                        this.activites[recipient] = {
                            seen: seen,
                            last: new Date(item.lastMessage.timestamp),
                        };
                    });
                })
            );
    }

    openChat(recipientId: string){
      return this.http.put(environment.backend_endpoint + '/chats/activity/' + recipientId, {

      }).subscribe(res => {
        if (this.activites[recipientId]){
          this.activites[recipientId].seen = true
        }
      })
    }

    SeenChat(recipientId){
      if (this.activites[recipientId]){
        return this.activites[recipientId].seen
      }
      return null
    }

    getChatMessages(userId: string, skip: number, limit: number) {
        const query = new HttpParams().appendAll({
            skip: skip,
            limit: limit,
        });

        return this.http
            .get<{ messages: messageHttpResponse[] }>(
                environment.backend_endpoint + '/chats/' + userId,
                {
                    params: query,
                }
            )
            .pipe(
                map((res) => {
                    const newRes: Message[] = [];

                    res.messages.forEach((item) => {
                        newRes.push(
                            new Message(
                                item.sender,
                                item.content,
                                new Date(item.timestamp)
                            )
                        );
                    });

                    return newRes;
                })
            );
    }

    sendChatMessage(userId: string, message: string) {
        return this.http.post(
            environment.backend_endpoint + '/chats/' + userId,
            {
                message: message,
            }
        );
    }

    resortFriends(){
        this.friends.sort((user1, user2) => {
            const lastInteraction1 = this.activites[user1.id] ? this.activites[user1.id].last : new Date(-8640000000000000)
            const lastInteraction2 = this.activites[user2.id] ? this.activites[user2.id].last : new Date(-8640000000000000)
            if (lastInteraction1>lastInteraction2){
                return -1
            }
            else if (lastInteraction1<lastInteraction2){
                return 1;
            }
            else {
                return 0;
            }
        })
    }
}
