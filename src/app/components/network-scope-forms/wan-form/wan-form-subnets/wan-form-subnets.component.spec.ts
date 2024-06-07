import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of } from 'rxjs';
import {
  V1NetworkScopeFormsWanFormSubnetService,
  V1NetworkScopeFormsWanFormService,
  V1NetworkSubnetsService,
  V2AppCentricAppCentricSubnetsService,
  WanForm,
} from '../../../../../../client';
import { WanFormSubnetModalDto } from '../../../../models/network-scope-forms/wan-form-subnet-modal.dto';
import { ModalMode } from '../../../../models/other/modal-mode';
import { TableContextService } from '../../../../services/table-context.service';
import { WanFormSubnetsComponent } from './wan-form-subnets.component';
import { MockComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent } from '../../../../../test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('WanFormSubnetsComponent', () => {
  let component: WanFormSubnetsComponent;
  let fixture: ComponentFixture<WanFormSubnetsComponent>;
  let mockNgxSmartModalService: any;
  let mockWanFormSubnetService: any;
  let mockWanFormService: any;
  let mockNetcentricSubnetService: any;
  let mockAppcentricSubnetService: any;
  let mockRouter: any;
  let mockRoute: any;
  let mockTableContextService: any;

  beforeEach(async () => {
    mockNgxSmartModalService = {
      close: jest.fn(),
      resetModalData: jest.fn(),
      getModalData: jest.fn().mockReturnValue({}),
      setModalData: jest.fn(),
      getModal: jest.fn().mockReturnValue({
        open: jest.fn(),
        onCloseFinished: {
          subscribe: jest.fn().mockImplementation(() => ({ unsubscribe: jest.fn() })),
        },
      }),
    };

    mockWanFormSubnetService = {
      getManyWanFormSubnet: jest.fn().mockReturnValue(of({})),
      createOneWanFormSubnet: jest.fn().mockReturnValue(of({})),
      updateOneWanFormSubnet: jest.fn().mockReturnValue(of({})),
      deleteOneWanFormSubnet: jest.fn().mockReturnValue(of({})),
      softDeleteOneWanFormSubnet: jest.fn().mockReturnValue(of({})),
      restoreOneWanFormSubnet: jest.fn().mockReturnValue(of({})),
    };

    mockWanFormService = {
      getOneWanForm: jest.fn().mockReturnValue(of({})),
    };

    mockNetcentricSubnetService = {
      getSubnetsByDatacenterIdSubnet: jest.fn().mockReturnValue(of([])),
    };

    mockAppcentricSubnetService = {
      getManyAppCentricSubnet: jest.fn().mockReturnValue(of([])),
    };

    mockRouter = {
      navigate: jest.fn(),
      getCurrentNavigation: jest.fn().mockReturnValue({ extras: { state: { data: {} } } }),
    };

    mockRoute = {
      snapshot: {
        params: { id: 'testWanFormId' },
        queryParams: {},
        data: { mode: 'netcentric' },
      },
    };

    mockTableContextService = {
      getSearchLocalStorage: jest.fn().mockReturnValue({}),
    };

    await TestBed.configureTestingModule({
      declarations: [
        MockNgxSmartModalComponent,
        WanFormSubnetsComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockComponent('app-wan-form-subnets-modal'),
      ],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: V1NetworkScopeFormsWanFormSubnetService, useValue: mockWanFormSubnetService },
        { provide: V1NetworkScopeFormsWanFormService, useValue: mockWanFormService },
        { provide: V1NetworkSubnetsService, useValue: mockNetcentricSubnetService },
        { provide: V2AppCentricAppCentricSubnetsService, useValue: mockAppcentricSubnetService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: TableContextService, useValue: mockTableContextService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WanFormSubnetsComponent);
    component = fixture.componentInstance;
    component.wanForm = { id: 'testWanFormId' } as WanForm;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set wanFormId and dcsMode from route snapshot', () => {
      component.ngOnInit();
      expect(component.wanFormId).toBe('testWanFormId');
      expect(component.dcsMode).toBe('netcentric');
    });

    it('should fetch WAN form subnets on initialization', () => {
      const getWanFormSubnetsSpy = jest.spyOn(component, 'getWanFormSubnets');
      component.ngOnInit();
      expect(getWanFormSubnetsSpy).toHaveBeenCalled();
    });
  });

  describe('getWanFormSubnets', () => {
    it('should set isLoading to true and fetch WAN form subnets', () => {
      component.getWanFormSubnets();
      expect(component.isLoading).toBe(false);
      expect(mockWanFormSubnetService.getManyWanFormSubnet).toHaveBeenCalledWith({
        filter: ['wanFormId||eq||testWanFormId', undefined],
        join: ['netcentricSubnet', 'appcentricSubnet'],
        page: 1,
        perPage: 20,
      });
    });

    it('should update wanFormSubnets and set isLoading to false on success', () => {
      const wanFormSubnetsMock = { data: [{ id: '1' }, { id: '2' }] };
      mockWanFormSubnetService.getManyWanFormSubnet.mockReturnValue(of(wanFormSubnetsMock));
      component.getWanFormSubnets();
      expect(component.wanFormSubnets).toEqual(wanFormSubnetsMock);
      expect(component.isLoading).toBe(false);
    });
  });

  describe('openModal', () => {
    it('should set modal data and open the modal', () => {
      const dto = new WanFormSubnetModalDto();
      dto.modalMode = ModalMode.Create;
      dto.wanFormId = 'testWanFormId';

      component.openModal(ModalMode.Create);
      expect(mockNgxSmartModalService.setModalData).toHaveBeenCalledWith(dto, 'wanFormSubnetModal');
      expect(mockNgxSmartModalService.getModal('wanFormSubnetModal').open).toHaveBeenCalled();
    });
  });

  describe('subscribeToModal', () => {
    it('should reset modal data and fetch WAN form subnets on modal close', () => {
      (component as any).subscribeToModal();
      expect((component as any).modalSubscription).not.toBeNull();
    });
  });

  describe('deleteWanFormSubnet', () => {
    it('should call delete service and fetch WAN form subnets', () => {
      const wanFormSubnetMock = { id: '1', deletedAt: null } as any;
      component.deleteWanFormSubnet(wanFormSubnetMock);
      expect(mockWanFormSubnetService.softDeleteOneWanFormSubnet).toHaveBeenCalledWith({ id: '1' });
    });

    it('should call hard delete service if deletedAt is set and fetch WAN form subnets', () => {
      const wanFormSubnetMock = { id: '1', deletedAt: new Date() } as any;
      component.deleteWanFormSubnet(wanFormSubnetMock);
      expect(mockWanFormSubnetService.deleteOneWanFormSubnet).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('restoreWanFormSubnet', () => {
    it('should call restore service and fetch WAN form subnets', () => {
      const wanFormSubnetMock = { id: '1' } as any;
      component.restoreWanFormSubnet(wanFormSubnetMock);
      expect(mockWanFormSubnetService.restoreOneWanFormSubnet).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('navigateToWanForm', () => {
    it('should navigate to WAN form page with current query params', () => {
      component.navigateToWanForm();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/netcentric/wan-form'], { queryParams: {} });
    });
  });

  describe('getChildren', () => {
    it('should call getSubnetVlans if dcsMode is netcentric', () => {
      const getSubnetVlansSpy = jest.spyOn(component, 'getSubnetVlans');
      component.dcsMode = 'netcentric';
      component.getChildren();
      expect(getSubnetVlansSpy).toHaveBeenCalled();
    });

    it('should call getSubnetBridgeDomains if dcsMode is appcentric', () => {
      const getSubnetBridgeDomainsSpy = jest.spyOn(component, 'getSubnetBridgeDomains');
      component.dcsMode = 'appcentric';
      component.getChildren();
      expect(getSubnetBridgeDomainsSpy).toHaveBeenCalled();
    });
  });

  describe('getSubnetVlans', () => {
    it('should fetch subnet VLANs for netcentric mode', () => {
      const netcentricSubnetsMock = [{ id: '1', vlan: {} }];
      mockNetcentricSubnetService.getSubnetsByDatacenterIdSubnet.mockReturnValue(of(netcentricSubnetsMock));
      component.getSubnetVlans();
      expect(component.subnetVlans.get('1')).toEqual({});
    });
  });

  describe('getSubnetBridgeDomains', () => {
    it('should fetch subnet bridge domains for appcentric mode', () => {
      const appcentricSubnetsMock = [{ id: '1', bridgeDomain: {} }];
      mockAppcentricSubnetService.getManyAppCentricSubnet.mockReturnValue(of(appcentricSubnetsMock));
      component.getSubnetBridgeDomains();
      expect(component.subnetBridgeDomains.get('1')).toEqual({});
    });
  });
});
