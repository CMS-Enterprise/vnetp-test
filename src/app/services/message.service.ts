import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AppMessage } from '../models/app-message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
    private subject = new Subject<any>();

    listen(): Observable<AppMessage> {
       return this.subject.asObservable();
    }

    sendMessage(m: AppMessage) {
       this.subject.next(m);
    }

    clearMessages() {
       this.subject.next();
    }
}
