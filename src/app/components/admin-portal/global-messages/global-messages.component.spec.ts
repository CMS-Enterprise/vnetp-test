/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockNgxSmartModalComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { GetManyMessageResponseDto, Message, V3GlobalMessagesService } from 'client';
import { GlobalMessagesComponent } from './global-messages.component';
import { Subject, Subscription, of } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

describe('GlobalMessagesComponent', () => {
  let component: GlobalMessagesComponent;
  let fixture: ComponentFixture<GlobalMessagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage'] }),
        MockComponent({ selector: 'app-global-messages-modal' }),
        GlobalMessagesComponent,
        MockFontAwesomeComponent,
        MockYesNoModalComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
      ],
      providers: [MockProvider(V3GlobalMessagesService), MockProvider(NgxSmartModalService)],
      imports: [HttpClientModule],
    });
    fixture = TestBed.createComponent(GlobalMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Get Messages', () => {
    it('should fetch messages', () => {
      const messageService = TestBed.inject(V3GlobalMessagesService);
      const messagesMock: GetManyMessageResponseDto = {
        totalPages: 1,
        total: 2,
        count: 2,
        page: 1,
        pageCount: 1,
        data: [{ id: '1', description: 'message1', timestamp: new Date().toISOString() } as Message, { id: '2', description: 'message2', timestamp: new Date().toISOString() } as Message],
      };
      component.messages = messagesMock;

      const getManyMessagesSpy = jest.spyOn(messageService, 'getManyMessage').mockReturnValue(of({ data: messagesMock } as any));

      messageService.getManyMessage({ page: 1, perPage: 50 });
      expect(getManyMessagesSpy).toHaveBeenCalled();
      expect(component['messages']).toEqual(messagesMock);
    });
  });

  describe('openModal', () => {
    beforeEach(() => {
      jest.spyOn(component, 'getGlobalMessages');
      jest.spyOn(component['ngx'], 'resetModalData');
    });

    it('should subscribe to globalMessagesModal onCloseFinished event and unsubscribe afterwards', () => {
      const onCloseFinished = new Subject<void>();
      const mockModal = { onCloseFinished, open: jest.fn() };
      jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

      const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

      component.subscribeToGlobalMessagesModal();

      expect(component['ngx'].getModal).toHaveBeenCalledWith('globalMessagesModal');
      expect(component.globalMessageModalSubscription).toBeDefined();

      onCloseFinished.next();

      expect(component.getGlobalMessages).toHaveBeenCalled();
      expect(component['ngx'].resetModalData).toHaveBeenCalledWith('globalMessagesModal');

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
    it('should open modal with correct modalMode', () => {
      const modalMode = ModalMode.Create;
      jest.spyOn(component['ngx'], 'setModalData');
      const onCloseFinished = new Subject<void>();
      jest.spyOn(component['ngx'], 'getModal').mockReturnValue({ open: jest.fn(), onCloseFinished } as any);

      component.openGlobalMessagesModal(modalMode);

      const expectedDto = {
        ModalMode: modalMode,
      };

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expectedDto, 'globalMessagesModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('globalMessagesModal');
      expect(component['ngx'].getModal('globalMessagesModal').open).toHaveBeenCalled();
    });
  });

  describe('Delete Message', () => {
    it('should delete message', () => {
      const messageToDelete = { id: '123', description: 'Bye!' } as Message;
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
      component.deleteEntry(messageToDelete);
      const getMessagesMock = jest.spyOn(component['globalMessagesService'], 'getManyMessage');
      expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
      expect(getMessagesMock).toHaveBeenCalled();
    });
  });
});
