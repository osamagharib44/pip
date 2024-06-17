import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { FriendsComponent } from './friends/friends.component';
import { MyComponent } from './friends/my/my.component';
import { RequestsComponent } from './friends/requests/requests.component';
import { AddComponent } from './friends/add/add.component';
import { ChatsComponent } from './chats/chats.component';
import { ErrorsComponent } from './errors/errors.component';
import { E400Component } from './errors/e400/e400.component';
import { E404Component } from './errors/e404/e404.component';
import { E500Component } from './errors/e500/e500.component';
import { AuthGuard } from './shared/auth-guard.guard';
import { NoAuthGuard } from './shared/no-auth-guard.guard';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
    { path: 'signin', component: SigninComponent, canActivate:[NoAuthGuard] },
    { path: 'signup', component: SignupComponent, canActivate:[NoAuthGuard]  },
    
    { path: 'profile', component: ProfileComponent, canActivate:[AuthGuard] },
    {path: 'friends', redirectTo: 'friends/my', pathMatch: 'full'},
    { path: 'friends', component: FriendsComponent, canActivate:[AuthGuard], children: [
        { path: 'my', component: MyComponent },
        { path: 'requests', component: RequestsComponent },
        { path: 'add', component: AddComponent },
    ] },

    { path: 'chats', component: ChatsComponent, canActivate:[AuthGuard], pathMatch: 'full'},
    { path: 'chats/:userId', component: ChatsComponent, canActivate:[AuthGuard]},

    //error pages
    { path: 'error', component: ErrorsComponent, children:[
        { path: '404', component: E404Component },
        { path: '400', component: E400Component },
        { path: '500', component: E500Component },
    ] },

    //generalized
    { path: '', redirectTo: 'chats', pathMatch: 'full' },
    { path: '**', redirectTo: 'error/404' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
