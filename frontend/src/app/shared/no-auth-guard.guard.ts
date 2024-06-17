import { inject } from "@angular/core";
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "./services/auth.service";

export const NoAuthGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    Observable<boolean> 
    | Promise<boolean> 
    | boolean => {
  
    return inject(AuthService).token==null
      ? true
      : inject(Router).navigate(['/chats']);
  
  };