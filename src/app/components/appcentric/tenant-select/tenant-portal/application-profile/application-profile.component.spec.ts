/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockNgxSmartModalComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { ApplicationProfileComponent } from './application-profile.component';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { of, Subject, Subscription } from 'rxjs';
import { ApplicationProfile, V2AppCentricApplicationProfilesService, V2AppCentricEndpointGroupsService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { ApplicationProfileModalDto } from 'src/app/models/appcentric/application-profile-modal-dto';

describe('ApplicationProfileComponent', () => {
  let component: ApplicationProfileComponent;
  let fixture: ComponentFixture<ApplicationProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ApplicationProfileComponent,
        MockComponent({ selector: 'app-application-profile-modal', inputs: ['tenantId'] }),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
        MockComponent('app-ap-endpoint-group-modal'),
      ],
      imports: [HttpClientModule, RouterTestingModule],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V2AppCentricEndpointGroupsService),
        MockProvider(V2AppCentricApplicationProfilesService),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('importAppProfilesConfig', () => {
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
      const event = [{ name: 'Application Profile 1' }, { name: 'Application Profile 1' }] as any;
      const modalDto = new YesNoModalDto(
        'Import Application Profiles',
        `Are you sure you would like to import ${event.length} Application Profiles?`,
      );
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importAppProfiles(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import application profiles and refresh the table on confirmation', () => {
      const event = [{ name: 'Application Profile 1' }, { name: 'Application Profile 1' }] as any;
      jest.spyOn(component, 'getApplicationProfiles');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['applicationProfileService'].createManyApplicationProfile).toHaveBeenCalledWith({
          createManyApplicationProfileDto: { bulk: component.sanitizeData(event) },
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

      component.importAppProfiles(event);

      expect(component.getApplicationProfiles).toHaveBeenCalled();
    });
  });

  it('should delete app profile', () => {
    const appProfileToDelete = { id: '123', description: 'Bye!' } as ApplicationProfile;
    const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
    component.deleteApplicationProfile(appProfileToDelete);
    const getAppProfilesMock = jest.spyOn(component['applicationProfileService'], 'getManyApplicationProfile');
    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(getAppProfilesMock).toHaveBeenCalled();
  });

  it('should restore application profile', () => {
    const appProfile = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['applicationProfileService'], 'restoreOneApplicationProfile').mockReturnValue(of({} as any));
    jest.spyOn(component, 'getApplicationProfiles');
    component.restoreApplicationProfile(appProfile);
    expect(component['applicationProfileService'].restoreOneApplicationProfile).toHaveBeenCalledWith({ id: appProfile.id });
    expect(component.getApplicationProfiles).toHaveBeenCalled();
  });

  it('should apply search params when filtered results is true', () => {
    const appProfile = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['applicationProfileService'], 'restoreOneApplicationProfile').mockReturnValue(of({} as any));

    const getAppProfilesSpy = jest.spyOn(component, 'getApplicationProfiles');
    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

    component.restoreApplicationProfile(appProfile);

    // expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
    // expect(component.tableComponentDto.searchText).toBe(params.searchText);
    expect(getAppProfilesSpy).toHaveBeenCalledWith(params);
  });

  describe('openApplicationProfileModal', () => {
    describe('openModal', () => {
      beforeEach(() => {
        jest.spyOn(component, 'getApplicationProfiles');
        jest.spyOn(component['ngx'], 'resetModalData');
      });

      it('should subscribe to applicationProfileModal onCloseFinished event and unsubscribe afterwards', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

        const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

        component.subscribeToApplicationProfileModal();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('applicationProfileModal');
        expect(component.applicationPofileModalSubscription).toBeDefined();

        onCloseFinished.next();

        expect(component.getApplicationProfiles).toHaveBeenCalled();
        expect(component['ngx'].resetModalData).toHaveBeenCalledWith('applicationProfileModal');

        expect(unsubscribeSpy).toHaveBeenCalled();
      });
      it('should call ngx.setModalData and ngx.getModal().open', () => {
        const appProfile = { id: 1, name: 'Test App Profile' } as any;
        component.tenantId = { id: '1' } as any;
        component.openApplicationProfileModal(ModalMode.Edit, appProfile);

        expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(ApplicationProfileModalDto), 'applicationProfileModal');
        expect(component['ngx'].getModal).toHaveBeenCalledWith('applicationProfileModal');

        const modal = component['ngx'].getModal('applicationProfileModal');
        expect(modal).toBeDefined();
      });
    });
  });
});
