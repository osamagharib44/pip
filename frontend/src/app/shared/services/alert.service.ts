import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  public alertMessageSubject = new BehaviorSubject<string | null>(null);

  setMessage(message: string) {
    this.alertMessageSubject.next(message);
  }

  clearMessage() {
    this.alertMessageSubject.next(null);
  }
}
