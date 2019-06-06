import { TestBed } from '@angular/core/testing';

import { MessageService } from './message.service';
import { AppMessage } from '../models/app-message';

describe('MessageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MessageService = TestBed.get(MessageService);
    expect(service).toBeTruthy();
  });

  it('should receive message', () => {
    const service: MessageService = TestBed.get(MessageService);
    service.sendMessage(new AppMessage(''));
  });
});
