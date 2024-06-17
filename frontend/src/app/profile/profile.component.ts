import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { UserService } from '../shared/services/user.service';
import { AlertService } from '../shared/services/alert.service';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
    @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
    selectedFile: File;
    imagePreview: string | ArrayBuffer | null;
    errorMessage: string;

    maxUsernameLen = 25;
    minPasswordLen = 5;
    isLoading = false;
    form: FormGroup;

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private router: Router,
        private alertService: AlertService
    ) {}

    ngOnInit(): void {
        this.imagePreview = this.userService.user.value.imagePath;

        this.form = new FormGroup({
            username: new FormControl(
                this.userService.user.value.username,
                [
                    Validators.required,
                    Validators.maxLength(this.maxUsernameLen),
                    Validators.pattern('^[a-zA-Z0-9_]*$'),
                ],
                [this.uniqueUsernameValidator.bind(this)]
            ),
            oldPassword: new FormControl(null, [Validators.required]),
            newPassword: new FormControl(null, [
                Validators.required,
                Validators.minLength(this.minPasswordLen),
            ]),
        });
    }

    openFileSelector() {
        this.fileInput.nativeElement.click();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            if (!file.type.startsWith('image/')) {
                this.errorMessage =
                    'Please select a valid image file (PNG, JPEG).';
                this.selectedFile = null;
                this.imagePreview = null;
                return;
            }

            this.selectedFile = file;
            const reader = new FileReader();

            reader.onload = () => {
                this.imagePreview = reader.result;
            };

            reader.readAsDataURL(file);
            this.errorMessage = null;
        }
    }

	onSubmit() {
        const username = this.form.get('username').value;
        const oldPassword = this.form.get('oldPassword').value;
        const newPassword = this.form.get('newPassword').value;

        this.isLoading = true;

        this.authService
            .updateProfile({
                username: username,
                oldPassword: oldPassword,
                password: newPassword,
                image: this.selectedFile,
            })
            .subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.userService.user.value.username = username;
                    this.userService.user.value.imagePath = response.newImagePath
                    this.router.navigate(['/']);
                },
                error: (err) => {
                    this.isLoading = false;
                    if (err.status == 400) {
                        this.alertService.setMessage(
                            'Invalid input data, please make sure you entered correct password and valid username'
                        );
                    } else {
                        this.router.navigate(['/error/500']);
                    }
                },
            });
    }

    uniqueUsernameValidator(control: FormControl) {
        if (control.value == this.userService.user.value.username) {
            //return null;
            return new Observable((subscriber) => {
                subscriber.next(null);
                subscriber.complete();
            });
        }
        return this.authService.validateUsername(control.value).pipe(
            map((data) => {
                if (data.valid) {
                    return null;
                }
                return { usernameExists: true };
            })
        );
    }
}
