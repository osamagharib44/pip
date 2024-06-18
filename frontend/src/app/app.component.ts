import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './shared/services/auth.service';
import { SocketService } from './shared/services/socket.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  

  constructor(private authService:AuthService, private socketService:SocketService){}

  ngOnInit(): void {
    console.log(environment.backend_endpoint)
    this.authService.autoLogin()
  }

  ngOnDestroy(): void {
    this.socketService.disconnect()
  }
}
