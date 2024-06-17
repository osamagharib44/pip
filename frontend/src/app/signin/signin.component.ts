import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css',
})
export class SigninComponent {
  form: FormGroup;
  isLoading = false;
  invalidationError = false

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      username: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [Validators.required]),
    });
  }

  onSubmit(){
    const username = this.form.get('username').value;
    const password = this.form.get('password').value;

    this.isLoading = true;
    this.invalidationError = false;

    this.authService
      .signin({
        username: username,
        password: password,
      })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          //console.log(response)
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status == 400) {
            this.invalidationError = true;
          } else {
            this.router.navigate(['/error/500']);
          }
        },
      });
  }
}
