import {
    AfterViewChecked,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Message } from '../shared/models/message.model';
import { UserMini } from '../shared/models/user-mini.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SocketService } from '../shared/services/socket.service';
import { ChatsService } from '../shared/services/chats.service';

@Component({
    selector: 'app-chats',
    templateUrl: './chats.component.html',
    styleUrl: './chats.component.css',
})
export class ChatsComponent implements OnInit, OnDestroy, AfterViewChecked {
    @ViewChild('scrollable') private scrollable: ElementRef;

    MESSAGES_LIMIT = 0;
    form: FormGroup;

    currentlyOpened: UserMini;
    subscription: Subscription = new Subscription();
    messages: Message[] = [];
    newMessageSub: Subscription = new Subscription();
    updatedScroll = false;

    constructor(
        public chatsService: ChatsService,
        private route: ActivatedRoute,
        private router: Router,
        private socketService: SocketService
    ) {}

    ngOnInit(): void {
        this.form = new FormGroup({
            message: new FormControl(null, [
                Validators.required,
                Validators.maxLength(250),
            ]),
        });

        const id = this.route.snapshot.params['userId'];
        this.updateCurrentFromId(id);
        this.subscription = this.route.params.subscribe((params) => {
            const id = params['userId'];
            this.updateCurrentFromId(id);
        });

        //on new message
        this.newMessageSub = this.socketService.newMessage.subscribe((data) => {
            const sender = data.msg.sender;
            const receiver = data.receiver;
            const msg = data.msg;
            if (sender == this.chatsService.me.id) {
                if (this.currentlyOpened.id == receiver) {
                    this.messages.push(msg);
                    this.updatedScroll = false;
                }
                this.chatsService.activites[receiver] = {
                    seen: true,
                    last: msg.timestamp,
                };
            } else if (receiver == this.chatsService.me.id) {
                if (this.currentlyOpened.id == sender) {
                    this.messages.push(msg);
                    this.updatedScroll = false;
                    this.chatsService.activites[sender] = {
                        seen: true,
                        last: msg.timestamp,
                    };
                } else {
                    this.chatsService.activites[sender] = {
                        seen: false,
                        last: msg.timestamp,
                    };
                }
            }
            this.chatsService.resortFriends()
        });

        //load chat activities
        this.chatsService.getChatActivies().subscribe((res) => {
            this.chatsService.resortFriends()
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.newMessageSub.unsubscribe();
    }

    ngAfterViewChecked(): void {
        if (!this.scrollable || this.updatedScroll) return;
        this.updatedScroll = true;
        const scrollableElement = this.scrollable.nativeElement;
        scrollableElement.scrollTop = scrollableElement.scrollHeight;
    }


    //some ui func
    autoGrowTextZone(e) {
        e.target.style.minHeight = '50px';
        e.target.style.height = '0px';
        e.target.style.height = e.target.scrollHeight + 'px';
        e.target.style.maxHeight = '300px';
    }

    //other
    InChat(userId: string){
        if (this.currentlyOpened && this.currentlyOpened.id==userId){
            return true
        }
        return false
    }

    updateCurrentFromId(userId: string) {
        const user = this.chatsService.friends.find((item) => {
            if (item.id == userId) {
                return true;
            }
            return false;
        });
        this.currentlyOpened = user;
        this.form.reset();

        if (!this.currentlyOpened) {
            this.router.navigate(['/chats']);
        } else {
            this.retrieveMessages();
            this.chatsService.openChat(this.currentlyOpened.id);
        }
    }

    retrieveMessages() {
        this.chatsService
            .getChatMessages(this.currentlyOpened.id, 0, 0)
            .subscribe((res) => {
                this.messages = res;
                this.updatedScroll = false;
            });
    }

    sendMessage() {
        this.chatsService
            .sendChatMessage(
                this.currentlyOpened.id,
                this.form.get('message').value
            )
            .subscribe((res) => {
                console.log(res);
            });
        this.form.reset();
    }
}
