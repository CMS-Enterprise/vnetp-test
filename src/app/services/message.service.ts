import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import ObjectUtil from '../utils/ObjectUtil';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  public messageHistory: Message[] = [];
  private subject = new Subject<Message>();

  public listen(): Observable<Message> {
    return this.subject.asObservable();
  }

  public sendMessage(m: Message): void {
    if (!environment.production) {
      console.debug('DEBUG :: MessageService :: ', ObjectUtil.removeEmptyProps(m));
    }

    this.subject.next(m);
    this.messageHistory.push(m);
  }

  public clearMessages(): void {
    this.subject.next();
    this.messageHistory = [];
  }
}

export class Message {
  constructor(public readonly oldValue: string, public readonly newValue: string, public readonly message: string) {}
}
