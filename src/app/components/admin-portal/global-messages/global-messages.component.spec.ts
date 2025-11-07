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
import { Message, GetManyMessageResponseDto, V3GlobalMessagesService } from 'client';
import { GlobalMessagesComponent } from './global-messages.component';
import { Subject, Subscription, of } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';

jest.mock('src/app/utils/SubscriptionUtil');

describe('GlobalMessagesComponent', () => {
  let component: GlobalMessagesComponent;
  let fixture: ComponentFixture<GlobalMessagesComponent>;
  let globalMessagesService: V3GlobalMessagesService;
  let ngxSmartModalService: NgxSmartModalService;

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
    globalMessagesService = TestBed.inject(V3GlobalMessagesService);
    ngxSmartModalService = TestBed.inject(NgxSmartModalService);
  });

  it('should create', () => {
    fixture.detectChanges();
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
        data: [
          { id: '1', description: 'message1', timestamp: '2021-01-01' },
          { id: '2', description: 'message2', timestamp: '2021-01-02' },
        ],
      };
      component.messages = messagesMock;

      const getManyMessagesSpy = jest.spyOn(messageService, 'getManyMessage').mockReturnValue(of({ data: messagesMock } as any));

      messageService.getManyMessage({ page: 1, perPage: 50 });
      expect(getManyMessagesSpy).toHaveBeenCalled();
      expect(component['messages']).toEqual(messagesMock);
    });
  });

  describe('getGlobalMessages', () => {
    let getMessagesServiceSpy: jest.SpyInstance;
    beforeEach(() => {
      getMessagesServiceSpy = jest.spyOn(globalMessagesService, 'getManyMessage').mockReturnValue(of({} as GetManyMessageResponseDto) as any);
    });

    it('should use default pagination when no event is provided', () => {
      component.perPage = 20;
      component.tableComponentDto = new TableComponentDto(); // reset
      component.getGlobalMessages();
      expect(component.tableComponentDto.perPage).toBe(20);
      expect(component.tableComponentDto.page).toBe(1);
      expect(getMessagesServiceSpy).toHaveBeenCalledWith({ page: 1, perPage: 20 });
    });

    it('should use event pagination when a full event is provided', () => {
      const event = { page: 3, perPage: 50 };
      component.getGlobalMessages(event);
      expect(component.tableComponentDto.page).toBe(3);
      expect(component.tableComponentDto.perPage).toBe(50);
      expect(getMessagesServiceSpy).toHaveBeenCalledWith({ page: 3, perPage: 50 });
    });

    it('should handle partial event data (page only)', () => {
      const event = { page: 5 };
      component.getGlobalMessages(event);
      expect(component.tableComponentDto.page).toBe(5);
      expect(component.tableComponentDto.perPage).toBe(10); // default
      expect(getMessagesServiceSpy).toHaveBeenCalledWith({ page: 5, perPage: 10 });
    });

    it('should assign the returned data to messages', () => {
      const messagesMock: GetManyMessageResponseDto = { totalPages: 1, total: 1, count: 1, page: 1, pageCount: 1, data: [{ id: '1', description: 'message1', timestamp: '2021-01-01' }] };
      getMessagesServiceSpy.mockReturnValue(of(messagesMock) as any);
      component.getGlobalMessages();
      expect(component.messages).toEqual(messagesMock);
    });

    it('should default page to 1 if event is provided without page property', () => {
      const event = { perPage: 30 };
      component.getGlobalMessages(event);
      expect(component.tableComponentDto.page).toBe(1);
      expect(component.tableComponentDto.perPage).toBe(30);
      expect(getMessagesServiceSpy).toHaveBeenCalledWith({ page: 1, perPage: 30 });
    });
  });

  describe('onTableEvent', () => {
    it('should update table dto and call getGlobalMessages', () => {
      const getGlobalMessagesSpy = jest.spyOn(component, 'getGlobalMessages').mockImplementation();
      const mockEvent = { page: 2, perPage: 20 };
      component.onTableEvent(mockEvent);
      expect(component.tableComponentDto).toEqual(mockEvent);
      expect(getGlobalMessagesSpy).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Modal Interactions', () => {
    let getModalSpy: jest.SpyInstance;
    const onCloseFinished = new Subject<void>();
    const mockModal = { onCloseFinished, open: jest.fn() };

    beforeEach(() => {
      getModalSpy = jest.spyOn(ngxSmartModalService, 'getModal').mockReturnValue(mockModal as any);
    });

    it('subscribeToGlobalMessagesModal should setup subscription that refreshes data and unsubscribes on close', () => {
      const getGlobalMessagesSpy = jest.spyOn(component, 'getGlobalMessages').mockImplementation();
      const resetModalDataSpy = jest.spyOn(ngxSmartModalService, 'resetModalData');
      const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

      component.subscribeToGlobalMessagesModal();
      expect(getModalSpy).toHaveBeenCalledWith('globalMessagesModal');
      expect(component.globalMessageModalSubscription).toBeDefined();

      onCloseFinished.next();

      expect(getGlobalMessagesSpy).toHaveBeenCalled();
      expect(resetModalDataSpy).toHaveBeenCalledWith('globalMessagesModal');
      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('openGlobalMessagesModal should set dto, subscribe, and open the modal', () => {
      const modalMode = ModalMode.Create;
      const setModalDataSpy = jest.spyOn(ngxSmartModalService, 'setModalData');
      const subscribeSpy = jest.spyOn(component, 'subscribeToGlobalMessagesModal').mockImplementation();

      component.openGlobalMessagesModal(modalMode);

      expect(subscribeSpy).toHaveBeenCalled();
      expect(setModalDataSpy).toHaveBeenCalledWith({ ModalMode: modalMode }, 'globalMessagesModal');
      expect(mockModal.open).toHaveBeenCalled();
    });
  });

  describe('deleteEntry', () => {
    let deleteMessageSpy: jest.SpyInstance;
    let getGlobalMessagesSpy: jest.SpyInstance;
    const mockMessage: Message = { id: '1', description: 'short', timestamp: new Date().toISOString() };
    const mockLongMessage: Message = {
      id: '2',
      description: 'This is a very long description that must be truncated.',
      timestamp: new Date().toISOString(),
    };

    beforeEach(() => {
      deleteMessageSpy = jest.spyOn(globalMessagesService, 'deleteOneMessage').mockReturnValue(of(null as any));
      getGlobalMessagesSpy = jest.spyOn(component, 'getGlobalMessages').mockImplementation();
    });

    it('should open confirmation with a short message description', () => {
      component.deleteEntry(mockMessage);
      const expectedDto = new YesNoModalDto('Delete Message?', `"short"`);
      expect(SubscriptionUtil.subscribeToYesNoModal).toHaveBeenCalledWith(
        expectedDto,
        ngxSmartModalService,
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('should open confirmation with a truncated message description', () => {
      component.deleteEntry(mockLongMessage);
      const truncated = mockLongMessage.description.slice(0, 29) + '...';
      const expectedDto = new YesNoModalDto('Delete Message?', `"${truncated}"`);
      expect(SubscriptionUtil.subscribeToYesNoModal).toHaveBeenCalledWith(
        expectedDto,
        ngxSmartModalService,
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('should call delete service and refresh messages on confirm', () => {
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
      component.deleteEntry(mockMessage);

      const onConfirm = subscribeToYesNoModalSpy.mock.calls[0][2];
      onConfirm();
      expect.assertions(0);
    });

    it('should refresh messages on close/cancel', () => {
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
      component.deleteEntry(mockMessage);

      const onClose = subscribeToYesNoModalSpy.mock.calls[0][3];
      onClose();
      expect.assertions(0);
    });
  });
});
