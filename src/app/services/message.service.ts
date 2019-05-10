import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AppMessage } from '../models/app-message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
    private listeners = new Subject<any>();

    listen(): Observable<AppMessage> {
       return this.listeners.asObservable();
    }

    filter(filterBy: AppMessage) {
       this.listeners.next(filterBy);
    }
}
