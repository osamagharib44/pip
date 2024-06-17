import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { BehaviorSubject, map } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserMini } from '../models/user-mini.model';

interface userMiniHttpResponse {
    username: string;
    imagePath: string;
    _id: string;
}

@Injectable({
    providedIn: 'root',
})
export class UserService {
    user = new BehaviorSubject<User>(null);
    friendsHash = new Map<string, boolean>();
    friendRequestsHash = new Map<string, boolean>();
    sentRequestsToHash = new Map<string, boolean>();
    fetchingFriends = new BehaviorSubject<boolean>(false);
    fetchingRequests = new BehaviorSubject<boolean>(false);

    constructor(private http: HttpClient) {
        this.user.subscribe((newUser) => {
            this.friendsHash = new Map<string, boolean>();
            this.friendRequestsHash = new Map<string, boolean>()
            this.sentRequestsToHash = new Map<string, boolean>()
            if (!newUser) return;
            this.getFriendsFROM_DB();
            this.getFriendRequestsFROM_DB();
        });
    }

    getFriendsFROM_DB() {
        if (!this.user.value) return;

        this.fetchingFriends.next(true);
        this.http
            .get<{ friends: userMiniHttpResponse[] }>(
                environment.backend_endpoint + '/friends'
            )
            .subscribe((res) => {
                this.user.value.friends = [];
                this.friendsHash = new Map<string, boolean>()
                res.friends.forEach((item) => {
                    this.user.value.friends.push(
                        new UserMini(item._id, item.username, item.imagePath)
                    );
                    this.friendsHash[item._id] = true;
                });
                this.fetchingFriends.next(false);
            });
    }

    getFriendRequestsFROM_DB() {
        if (!this.user.value) {
            return;
        }

        this.fetchingRequests.next(true);
        this.http
            .get<{
                requests: userMiniHttpResponse[];
            }>(environment.backend_endpoint + '/friends/requests')
            .subscribe({
                next: (res) => {
                    this.user.value.friendRequests = [];
                    this.friendRequestsHash = new Map<string, boolean>()
                    res.requests.forEach((item) => {
                        this.user.value.friendRequests.push(
                            new UserMini(
                                item._id,
                                item.username,
                                item.imagePath
                            )
                        );
                        this.friendRequestsHash[item._id] = true;
                    });
                    this.fetchingRequests.next(false);
                },
            });
    }

    addFriendRequest(targetUserId: string) {
        this.sentRequestsToHash[targetUserId] = true;
        this.http
            .post(environment.backend_endpoint + '/friends/requests', {
                toSendUserId: targetUserId,
            })
            .subscribe((res) => {
                console.log(res);
            });
    }

    handleFriendRequest(targetUserId: string, accept: boolean) {
        const idx = this.user.value.friendRequests.findIndex((request) => {
            if (request.id == targetUserId) {
                return true;
            }
            return false;
        });

        if (idx >= 0) {
            this.user.value.friendRequests.splice(idx, 1);

            this.http
                .delete(
                    environment.backend_endpoint +
                        '/friends/requests/' +
                        targetUserId
                )
                .subscribe((res) => {
                    console.log(res);
                });

            if (accept) {
                this.http
                    .post(environment.backend_endpoint + '/friends', {
                        toAddUserId: targetUserId,
                    })
                    .subscribe((res) => {
                        console.log(res);
                        this.getFriendsFROM_DB();
                    });
            }
        }
    }

    searchForUser(keyword: string, skip: number, limit: number) {
        const query = new HttpParams().appendAll({
            keyword: keyword,
            skip: skip,
            limit: limit,
        });

        return this.http
            .get<{ total: number; users: userMiniHttpResponse[] }>(
                environment.backend_endpoint + '/friends/search',
                {
                    params: query,
                }
            )
            .pipe(
                map((res) => {
                    const newRes: UserMini[] = [];
                    res.users.forEach((item) => {
                        if (item._id == this.user.value.id) {
                            //res.total = res.total - 1;
                            //return;
                        }
                        newRes.push(
                            new UserMini(
                                item._id,
                                item.username,
                                item.imagePath
                            )
                        );
                    });
                    return {
                        total: res.total,
                        users: newRes,
                    };
                })
            );
    }

}
