import { Component, OnInit } from '@angular/core';
import { AlertService } from '../shared/services/alert.service';


@Component({
  selector: 'alert-display',
  templateUrl: './alert-display.component.html',
  styleUrls: ['./alert-display.component.css']
})
export class AlertDisplayComponent implements OnInit {
  alertMessage: string;

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.alertService.alertMessageSubject.subscribe(message => {
      this.alertMessage = message
    });
  }

  clearAlert() {
    this.alertService.clearMessage();
  }
}
