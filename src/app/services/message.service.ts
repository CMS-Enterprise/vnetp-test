import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AppMessage } from '../models/app-message';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private subject = new Subject<any>();
  public messageHistory = new Array<AppMessage>();

  listen(): Observable<AppMessage> {
    return this.subject.asObservable();
  }

  sendMessage(m: AppMessage) {
    if (!environment.production) {
      console.log('debug-messageService-->>', m);
    }

    this.subject.next(m);
    this.messageHistory.push(m);
  }

  clearMessages() {
    this.subject.next();
    this.messageHistory = new Array<AppMessage>();
  }
}
