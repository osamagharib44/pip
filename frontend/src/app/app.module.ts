;
import { E500Component } from './errors/e500/e500.component';
import { E404Component } from './errors/e404/e404.component';
import { E400Component } from './errors/e400/e400.component';

import { ErrorsComponent } from './errors/errors.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { FriendsComponent } from './friends/friends.component';
import { MyComponent } from './friends/my/my.component';
import { RequestsComponent } from './friends/requests/requests.component';
import { AddComponent } from './friends/add/add.component';
import { ChatsComponent } from './chats/chats.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptorService } from './shared/services/auth-interceptor.service';
import { AlertDisplayComponent } from './alert-display/alert-display.component';
import { ProfileComponent } from './profile/profile.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ProfileComponent,
    SignupComponent,
    SigninComponent,
    FriendsComponent,
    MyComponent,
    RequestsComponent,
    AddComponent,
    ChatsComponent,
    ErrorsComponent, E400Component, E404Component, E500Component, AlertDisplayComponent, ProfileComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
