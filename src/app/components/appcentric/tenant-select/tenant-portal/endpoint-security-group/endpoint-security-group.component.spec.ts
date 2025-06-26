/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  EndpointSecurityGroup,
  V2AppCentricEndpointSecurityGroupsService,
  V2AppCentricSelectorsService,
} from '../../../../../../../client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockImportExportComponent,
  MockYesNoModalComponent,
} from '../../../../../../test/mock-components';
import { HttpClientModule } from '@angular/common/http';
import { of, Subject, Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from 'src/test/mock-providers';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { EndpointSecurityGroupComponent } from './endpoint-security-group.component';

describe('EndpointSecurityGroupComponent', () => {
  let component: EndpointSecurityGroupComponent;
  let fixture: ComponentFixture<EndpointSecurityGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule],
      declarations: [
        EndpointSecurityGroupComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-endpoint-security-group-modal', inputs: ['tenantId'] }),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [
        MockProvider(V2AppCentricEndpointSecurityGroupsService),
        MockProvider(V2AppCentricSelectorsService),
        MockProvider(NgxSmartModalService),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndpointSecurityGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run onInit', () => {
    // spy functions
    const endpointSecurityGroupSpy = jest.spyOn(component, 'getEndpointSecurityGroups');
    const appProfilesSpy = jest.spyOn(component as any, 'getApplicationProfiles');
    const vrfsSpy = jest.spyOn(component as any, 'getVrfs');

    component.ngOnInit();

    // expectations
    expect(endpointSecurityGroupSpy).toHaveBeenCalled();
    expect(appProfilesSpy).toHaveBeenCalled();
    expect(vrfsSpy).toHaveBeenCalled();
  });

  it('should call getEndpointSecurityGroups on table event', () => {
    jest.spyOn(component, 'getEndpointSecurityGroups');
    component.onTableEvent({} as any);
    expect(component.getEndpointSecurityGroups).toHaveBeenCalled();
  });

  // ESG Functions
  describe('ESG functions', () => {
    it('should delete endpoint security group', () => {
      const endpointSecurityGroupToDelete = { id: '123', name: 'Test ESG', description: 'Bye!' } as EndpointSecurityGroup;
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
      jest.spyOn(component['endpointSecurityGroupService'], 'softDeleteOneEndpointSecurityGroup').mockReturnValue(of({} as any));
      jest.spyOn(component as any, 'refreshEndpointSecurityGroups');

      component.deleteEndpointSecurityGroup(endpointSecurityGroupToDelete);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalled();

      // Simulate modal confirmation
      const onConfirm = subscribeToYesNoModalSpy.mock.calls[0][2];
      onConfirm();

      expect(component['endpointSecurityGroupService'].softDeleteOneEndpointSecurityGroup).toHaveBeenCalledWith({ id: '123' });
    });

    it('should call refreshEndpointSecurityGroups with search params when filtered results is true', () => {
      const getEsgsSpy = jest.spyOn(component, 'getEndpointSecurityGroups');
      const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

      // Test refreshEndpointSecurityGroups helper method
      component['refreshEndpointSecurityGroups']();

      // expectations
      expect(getEsgsSpy).toHaveBeenCalledWith(params);
    });

    it('should restore endpoint security group', () => {
      const endpointSecurityGroup = { id: '1', name: 'Test ESG', deletedAt: true } as any;
      const subscribeToYesNoModalSpy = jest
        .spyOn(SubscriptionUtil, 'subscribeToYesNoModal')
        .mockImplementation((modalDto, ngx, onConfirm, onClose) => {
          // Just call onConfirm immediately for testing
          onConfirm();
          return new Subscription();
        });
      jest.spyOn(component['endpointSecurityGroupService'], 'restoreOneEndpointSecurityGroup').mockReturnValue(of({} as any));
      jest.spyOn(component as any, 'refreshEndpointSecurityGroups');

      component.restoreEndpointSecurityGroup(endpointSecurityGroup);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
      expect(component['endpointSecurityGroupService'].restoreOneEndpointSecurityGroup).toHaveBeenCalledWith({
        id: endpointSecurityGroup.id,
      });
    });

    it('should call refreshEndpointSecurityGroups and apply search params when filtered results is true', () => {
      const getEndpointSecurityGroupsSpy = jest.spyOn(component, 'getEndpointSecurityGroups');
      const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

      // Test refreshEndpointSecurityGroups helper method
      component['refreshEndpointSecurityGroups']();

      // expectation
      expect(getEndpointSecurityGroupsSpy).toHaveBeenCalledWith(params);
    });
  });

  describe('openEndpointSecurityGroupModal', () => {
    describe('openModal', () => {
      beforeEach(() => {
        jest.spyOn(component, 'getEndpointSecurityGroups');
        jest.spyOn(component['ngx'], 'resetModalData');
      });

      it('should subscribe to endpointSecurityGroupModal onCloseFinished event and unsubscribe afterwards', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

        const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

        (component as any).subscribeToEndpointSecurityGroupModal();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('endpointSecurityGroupModal');
        expect((component as any).endpointSecurityGroupModalSubscription).toBeDefined();

        onCloseFinished.next();

        expect(component.getEndpointSecurityGroups).toHaveBeenCalled();
        expect(component['ngx'].resetModalData).toHaveBeenCalledWith('endpointSecurityGroupModal');

        expect(unsubscribeSpy).toHaveBeenCalled();
      });
      it('should call ngx.setModalData and ngx.getModal().open', () => {
        const endpointSecurityGroup = { id: 1, name: 'Test Endpoint Security Group' } as any;
        component.tenantId = { id: '1' } as any;

        component.openEndpointSecurityGroupModal(ModalMode.Edit, endpointSecurityGroup);

        // expectations
        expect(component['ngx'].setModalData).toHaveBeenCalled();
        expect(component['ngx'].getModal).toHaveBeenCalledWith('endpointSecurityGroupModal');

        const modal = component['ngx'].getModal('endpointSecurityGroupModal');
        expect(modal).toBeDefined();
      });
    });
  });

  describe('importEndpointSecurityGroupsConfig', () => {
    const mockNgxSmartModalComponent = {
      getData: jest.fn().mockReturnValue({ modalYes: true }),
      removeData: jest.fn(),
      onCloseFinished: {
        subscribe: jest.fn(),
      },
    };

    beforeEach(() => {
      component['ngx'] = {
        getModal: jest.fn().mockReturnValue({
          ...mockNgxSmartModalComponent,
          open: jest.fn(),
        }),
        setModalData: jest.fn(),
      } as any;
    });

    it('should display a confirmation modal with the correct message', () => {
      const event = [{ name: 'EndpointSecurityGroup 1' }, { name: 'EndpointSecurityGroup 2' }] as any;
      const modalDto = new YesNoModalDto(
        'Import Endpoint Security Groups',
        `Are you sure you would like to import ${event.length} EndpointSecurity Group${event.length > 1 ? 's' : ''}?`,
      );
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importEndpointSecurityGroups(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import Endpoint Security Groups and refresh the table on confirmation', () => {
      const event = [{ name: 'EndpointSecurityGroup 1' }, { name: 'EndpointSecurityGroup 2' }] as any;

      // spy functions
      jest.spyOn(component, 'getEndpointSecurityGroups');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm) => {
        onConfirm();

        expect(component['endpointSecurityGroupService'].createManyEndpointSecurityGroup).toHaveBeenCalledWith({
          createManyEndpointSecurityGroupDto: { bulk: component.sanitizeData(event) },
        });

        mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
          const data = modal.getData() as YesNoModalDto;
          modal.removeData();
          if (data && data.modalYes) {
            onConfirm();
          }
        });

        return new Subscription();
      });

      component.importEndpointSecurityGroups(event);

      // expectations
      expect(component.getEndpointSecurityGroups).toHaveBeenCalled();
    });
  });
});
