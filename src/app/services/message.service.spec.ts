import { MessageService } from './message.service';
import { AppMessage } from '../models/app-message';

describe('MessageService', () => {
  let service: MessageService;
  beforeEach(() => (service = new MessageService()));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should receive message', () => {
    service.sendMessage(new AppMessage(''));
    expect(service.messageHistory.length).toBe(1);
  });
});
