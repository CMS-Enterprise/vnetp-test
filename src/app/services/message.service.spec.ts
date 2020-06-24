import { MessageService } from './message.service';
import { AppMessage } from '../models/app-message';
import { environment } from 'src/environments/environment';

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

  it('should clear messages out', () => {
    service.sendMessage(new AppMessage(''));
    service.clearMessages();

    expect(service.messageHistory.length).toBe(0);
  });

  it('should listen to the message service', done => {
    const message = new AppMessage('Hello!');

    const sub = service.listen().subscribe(msg => {
      expect(msg).toBe(message);
      sub.unsubscribe();
      done();
    });

    service.sendMessage(message);
  });

  it('should not log a message when running in production', () => {
    const consoleSpy = spyOn(console, 'log').and.callThrough();
    environment.production = true;

    service.sendMessage(new AppMessage('Hello!'));
    expect(consoleSpy).not.toHaveBeenCalled();
    environment.production = false;
  });
});
