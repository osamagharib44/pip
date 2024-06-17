import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, delay, tap } from 'rxjs';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { SocketService } from './socket.service';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private _token: string;
    private _expiration: Date;
    private timer;

    constructor(
        private http: HttpClient,
        private userService: UserService,
        private router: Router,
        private socketService: SocketService,
        private alertService: AlertService
    ) {}

    get token(): string {
        if (
            this._token &&
            this._expiration &&
            Date.now() < this._expiration.getTime()
        ) {
            return this._token;
        }
        return null;
    }

    //add auto logout and auto login
    parseAndLogin(res) {
        this._token = res.token;
        this._expiration = new Date(res.expiration);
        if (this.token) {
            this.userService.user.next(
                new User(res.userId, res.username, res.email, res.imagePath)
            );
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(() => {
                if (this.token){
                    this.alertService.setMessage("Session expired, you will be redirected to the login page.")
                }
                this.logout();
            }, this._expiration.getTime() - Date.now());

            this.socketService.connect(this.token);
        } else {
            this.logout();
        }
    }

    autoLogin() {
        const data = JSON.parse(localStorage.getItem('userData'));
        if (data) {
            this.parseAndLogin(data);
        }
    }

    logout() {
        this._token = null;
        this._expiration = null;
        this.userService.user.next(null);
        this.router.navigate(['/signin']);
        localStorage.removeItem('userData');
        this.socketService.disconnect();
    }

    signin(userData: { username: string; password: string }) {
        return this.http
            .post<{
                userId: string;
                username: string;
                email: string;
                imagePath: string;
                token: string;
                expiration: Date;
            }>(environment.backend_endpoint + '/auth/signin', userData)
            .pipe(
                delay(1000),
                tap((res) => {
                    this.parseAndLogin(res);
                    localStorage.setItem('userData', JSON.stringify(res));

                    setTimeout(() => {
                        console.log(this.userService.user.value);
                    }, 2000);
                })
            );
    }

    signup(userData: { username: string; email: string; password: string }) {
        return this.http
            .post(environment.backend_endpoint + '/auth/signup', userData)
            .pipe(delay(1000));
    }

    updateProfile(userData: { username: string; oldPassword: string; password: string, image: File }) {
        const data = new FormData()
        data.append("username", userData.username)
        data.append("oldPassword", userData.oldPassword)
        data.append("password", userData.password)
        data.append("image", userData.image)

        return this.http
            .put<{message:string, newImagePath:string}>(environment.backend_endpoint + '/auth/update', data)
            .pipe(delay(1000));
    }
    
    validateEmail(email: string) {
        return this.http.get<{ valid: boolean }>(
            environment.backend_endpoint + '/auth/valid',
            { params: new HttpParams().append('email', email) }
        );
    }

    validateUsername(username: string) {
        return this.http.get<{ valid: boolean }>(
            environment.backend_endpoint + '/auth/valid',
            { params: new HttpParams().append('username', username) }
        );
    }
}
