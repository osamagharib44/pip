import { Component } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { UserMini } from '../../shared/models/user-mini.model';

@Component({
    selector: 'app-add',
    templateUrl: './add.component.html',
    styleUrl: './add.component.css',
})
export class AddComponent {
    searchResults: UserMini[] = [];
    currentPage = 1;
    DOC_PER_PAGE = 9;
    total = 0;
    keyword: string = '';
    fetching = false;

    constructor(public userService: UserService) {}

    getItemState(userId: string) {
        if (userId == this.userService.user.value.id) {
            return 0;
        } else if (this.userService.friendsHash[userId]) {
            return 1;
        } else if (this.userService.sentRequestsToHash[userId]) {
            return 2;
        } else {
            return 3;
        }
    }

    searchUp(resetPage: boolean) {
        if (this.keyword.length == 0 || this.fetching) {
            return;
        } else if (this.keyword.length >= 25) {
            this.keyword = this.keyword.substring(0, 25);
        }

        if (resetPage) {
            this.currentPage = 1;
        }

        this.fetching = true;
        this.userService
            .searchForUser(
                this.keyword,
                (this.currentPage - 1) * this.DOC_PER_PAGE,
                this.DOC_PER_PAGE
            )
            .subscribe((res) => {
                this.searchResults = res.users;
                this.total = res.total;
                this.fetching = false;
            });
    }

    goToPage(page: number) {
        let mxPage = Math.ceil(this.total / this.DOC_PER_PAGE);
        if (this.total==0){
            mxPage = 1
        }
        this.currentPage = ((page - 1 + mxPage) % mxPage) + 1;
        this.searchUp(false);
    }
}
