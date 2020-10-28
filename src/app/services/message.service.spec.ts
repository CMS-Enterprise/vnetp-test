import { Message, MessageService } from './message.service';
import { environment } from 'src/environments/environment';

describe('MessageService', () => {
  let service: MessageService;

  beforeEach(() => (service = new MessageService()));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should receive message', () => {
    service.sendMessage(new Message('0', '1', 'Change'));
    expect(service.messageHistory.length).toBe(1);
  });

  it('should clear messages out', () => {
    service.sendMessage(new Message('0', '1', 'Change'));
    service.clearMessages();

    expect(service.messageHistory.length).toBe(0);
  });

  it('should listen to the message service', done => {
    const message = new Message('0', '1', 'Change');

    const sub = service.listen().subscribe(msg => {
      expect(msg).toBe(message);
      sub.unsubscribe();
      done();
    });

    service.sendMessage(message);
  });

  it('should not log a message when running in production', () => {
    const consoleSpy = spyOn(console, 'debug').and.callThrough();
    environment.production = true;

    service.sendMessage(new Message('0', '1', 'Change'));
    expect(consoleSpy).not.toHaveBeenCalled();
    environment.production = false;
  });
});
