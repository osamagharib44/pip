import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { UserMini } from '../../shared/models/user-mini.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-requests',
    templateUrl: './requests.component.html',
    styleUrl: './requests.component.css',
})
export class RequestsComponent implements OnInit {
    results: UserMini[] = [];
    currentPage = 1;
    DOC_PER_PAGE = 9;
    sub: Subscription;
    fetching = false;

    constructor(public userService: UserService) {}

    ngOnInit(): void {
        if (this.sub) {
            this.sub.unsubscribe();
        }
        this.sub = this.userService.fetchingRequests.subscribe((val) => {
            this.fetching = val;
            if (val == false) {
                this.goToPage(1);
            }
        });
    }

    goToPage(page: number) {
        const total = this.userService.user.value.friendRequests.length;
        const mxPage = Math.ceil(total / this.DOC_PER_PAGE);
        this.currentPage = ((page - 1 + mxPage) % mxPage) + 1;

        const start = (this.currentPage - 1) * this.DOC_PER_PAGE;
        this.results = this.userService.user.value.friendRequests.slice(
            start,
            start + this.DOC_PER_PAGE
        );
    }

    handleFriendRequest(targetUserId: string, val:boolean){
        this.userService.handleFriendRequest(targetUserId, val)
        this.goToPage(this.currentPage)
    }
}
