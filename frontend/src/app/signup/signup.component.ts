import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { map } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
  form: FormGroup;
  maxUsernameLen = 25;
  minPasswordLen = 5;
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      username: new FormControl(
        null,
        [
          Validators.required,
          Validators.maxLength(this.maxUsernameLen),
          Validators.pattern('^[a-zA-Z0-9_]*$'),
        ],
        [this.uniqueUsernameValidator.bind(this)]
      ),
      email: new FormControl(
        null,
        [Validators.required, Validators.email],
        [this.uniqueEmailValidator.bind(this)]
      ),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(this.minPasswordLen),
      ]),
      confirmPassword: new FormControl(null, [
        Validators.required,
        this.confirmPassValidator.bind(this),
      ]),
    });
  }

  onSubmit() {
    const username = this.form.get('username').value;
    const email = this.form.get('email').value;
    const password = this.form.get('password').value;

    this.isLoading = true;

    this.authService
      .signup({
        username: username,
        email: email,
        password: password,
      })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/signin']);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status == 400) {
            this.router.navigate(['/error/400']);
          } else {
            this.router.navigate(['/error/500']);
          }
        },
      });
  }

  //validators

  uniqueUsernameValidator(control: FormControl) {
    return this.authService.validateUsername(control.value).pipe(
      map((data) => {
        if (data.valid) {
          return null;
        }
        return { usernameExists: true };
      })
    );
  }

  uniqueEmailValidator(control: FormControl) {
    return this.authService.validateEmail(control.value).pipe(
      map((data) => {
        if (data.valid) {
          return null;
        }
        return { emailExists: true };
      })
    );
  }

  confirmPassValidator(control: FormControl): { [s: string]: boolean } {
    if (control.parent) {
      if (control.value !== control.parent.get('password').value) {
        return { passwordMismatch: true };
      }
    }
    return null;
  }
}
