/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndpointGroupComponent } from './endpoint-group.component';
import { EndpointGroup, V2AppCentricEndpointGroupsService } from '../../../../../../../client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockImportExportComponent,
  MockYesNoModalComponent,
} from '../../../../../../test/mock-components';
import { HttpClientModule } from '@angular/common/http';
import { of, Subject, Subscription } from 'rxjs';
import { EndpointGroupModalDto } from 'src/app/models/appcentric/endpoint-group-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from 'src/test/mock-providers';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

describe('EndpointGroupComponent', () => {
  let component: EndpointGroupComponent;
  let fixture: ComponentFixture<EndpointGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule],
      declarations: [
        EndpointGroupComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-endpoint-group-modal', inputs: ['tenantId'] }),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [MockProvider(V2AppCentricEndpointGroupsService), MockProvider(NgxSmartModalService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndpointGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('importEndpointGroupsConfig', () => {
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
      const event = [{ name: 'EndpointGroup 1' }, { name: 'EndpointGroup 2' }] as any;
      const modalDto = new YesNoModalDto(
        'Import Endpoint Groups',
        `Are you sure you would like to import ${event.length} Endpoint Groups?`,
      );
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importEndpointGroups(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import route profiles and refresh the table on confirmation', () => {
      const event = [{ name: 'EndpointGroup 1' }, { name: 'EndpointGroup 2' }] as any;
      jest.spyOn(component, 'getEndpointGroups');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm) => {
        onConfirm();

        expect(component['endpointGroupService'].createManyEndpointGroup).toHaveBeenCalledWith({
          createManyEndpointGroupDto: { bulk: component.sanitizeData(event) },
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

      component.importEndpointGroups(event);

      expect(component.getEndpointGroups).toHaveBeenCalled();
    });
  });

  it('should delete endpoint group', () => {
    const endpointGroupToDelete = { id: '123', description: 'Bye!' } as EndpointGroup;
    component.deleteEndpointGroup(endpointGroupToDelete);
    const getAppProfilesMock = jest.spyOn(component['endpointGroupService'], 'getManyEndpointGroup');
    expect(getAppProfilesMock).toHaveBeenCalled();
  });

  it('should restore endpoint group', () => {
    const endpointGroup = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['endpointGroupService'], 'restoreOneEndpointGroup').mockReturnValue(of({} as any));
    jest.spyOn(component, 'getEndpointGroups');
    component.restoreEndpointGroup(endpointGroup);
    expect(component['endpointGroupService'].restoreOneEndpointGroup).toHaveBeenCalledWith({ id: endpointGroup.id });
    expect(component.getEndpointGroups).toHaveBeenCalled();
  });

  it('should routely search params when filtered results is true', () => {
    const endpointGroup = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['endpointGroupService'], 'restoreOneEndpointGroup').mockReturnValue(of({} as any));

    const getAppProfilesSpy = jest.spyOn(component, 'getEndpointGroups');
    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

    component.restoreEndpointGroup(endpointGroup);

    // expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
    // expect(component.tableComponentDto.searchText).toBe(params.searchText);
    expect(getAppProfilesSpy).toHaveBeenCalledWith(params);
  });

  describe('openEndpointGroupModal', () => {
    describe('openModal', () => {
      beforeEach(() => {
        jest.spyOn(component, 'getEndpointGroups');
        jest.spyOn(component['ngx'], 'resetModalData');
      });

      it('should subscribe to endpointGroupModal onCloseFinished event and unsubscribe afterwards', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

        const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

        component.subscribeToApEndpointGroupModal();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('endpointGroupModal');
        expect(component.endpointGroupModalSubscription).toBeDefined();

        onCloseFinished.next();

        expect(component.getEndpointGroups).toHaveBeenCalled();
        expect(component['ngx'].resetModalData).toHaveBeenCalledWith('endpointGroupModal');

        expect(unsubscribeSpy).toHaveBeenCalled();
      });
      it('should call ngx.setModalData and ngx.getModal().open', () => {
        const endpointGroup = { id: 1, name: 'Test Endpoint Group' } as any;
        component.tenantId = { id: '1' } as any;
        component.openEndpointGroupModal(ModalMode.Edit, endpointGroup);

        expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(EndpointGroupModalDto), 'endpointGroupModal');
        expect(component['ngx'].getModal).toHaveBeenCalledWith('endpointGroupModal');

        const modal = component['ngx'].getModal('endpointGroupModal');
        expect(modal).toBeDefined();
      });
    });
  });

  it('should run onInit', () => {
    const endpointGroupSpy = jest.spyOn(component, 'getEndpointGroups');
    const bridgeDomainsSpy = jest.spyOn(component, 'getBridgeDomains');
    const appProfilesSpy = jest.spyOn(component, 'getApplicationProfiles');

    component.ngOnInit();
    expect(bridgeDomainsSpy).toHaveBeenCalled();
    expect(appProfilesSpy).toHaveBeenCalled();
    expect(endpointGroupSpy).toHaveBeenCalled();
  });
});
