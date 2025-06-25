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
  let applicationProfileService: V2AppCentricApplicationProfilesService;

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
    applicationProfileService = TestBed.inject(V2AppCentricApplicationProfilesService);

    // Mock the service methods
    jest.spyOn(applicationProfileService, 'deleteOneApplicationProfile').mockReturnValue(of({} as any));
    jest.spyOn(applicationProfileService, 'softDeleteOneApplicationProfile').mockReturnValue(of({} as any));
    jest.spyOn(applicationProfileService, 'restoreOneApplicationProfile').mockReturnValue(of({} as any));
    jest.spyOn(applicationProfileService, 'deprovisionOneApplicationProfile').mockReturnValue(of({} as any));
    jest.spyOn(applicationProfileService, 'createManyApplicationProfile').mockReturnValue(of({} as any));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Helper Methods', () => {
    describe('refreshApplicationProfiles', () => {
      beforeEach(() => {
        jest.spyOn(component, 'getApplicationProfiles');
      });

      it('should call getApplicationProfiles without params when filteredResults is false', () => {
        const params = { filteredResults: false, searchString: '', searchColumn: null, searchText: '' };
        jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

        component['refreshApplicationProfiles']();

        expect(component.getApplicationProfiles).toHaveBeenCalledWith();
      });

      it('should call getApplicationProfiles with params when filteredResults is true', () => {
        const params = { filteredResults: true, searchColumn: 'name', searchText: 'test', searchString: '' };
        jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

        component['refreshApplicationProfiles']();

        expect(component.getApplicationProfiles).toHaveBeenCalledWith(params);
      });
    });

    describe('showConfirmationModal', () => {
      it('should create modal with correct parameters and call SubscriptionUtil', () => {
        const title = 'Test Title';
        const message = 'Test Message';
        const onConfirm = jest.fn();
        const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockReturnValue(new Subscription());
        jest.spyOn(component, 'refreshApplicationProfiles' as any);

        component['showConfirmationModal'](title, message, onConfirm);

        expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            cancelText: 'No',
            confirmButtonType: 'primary',
            confirmText: 'Yes',
            modalTitle: title,
            modalBody: message,
          }),
          component['ngx'],
          expect.any(Function),
          expect.any(Function),
        );
      });
    });
  });

  describe('deleteApplicationProfile', () => {
    it('should show confirmation modal for soft delete with correct message', () => {
      const appProfile = { id: '123', name: 'Test Profile', deletedAt: null } as ApplicationProfile;
      const showConfirmationModalSpy = jest.spyOn(component, 'showConfirmationModal' as any);

      component.deleteApplicationProfile(appProfile);

      expect(showConfirmationModalSpy).toHaveBeenCalledWith(
        'Soft Delete Application Profile',
        'Are you sure you want to soft delete Test Profile? This can be undone.',
        expect.any(Function),
      );
    });

    it('should show confirmation modal for hard delete with correct message', () => {
      const appProfile = { id: '123', name: 'Test Profile', deletedAt: new Date() } as any;
      const showConfirmationModalSpy = jest.spyOn(component, 'showConfirmationModal' as any);

      component.deleteApplicationProfile(appProfile);

      expect(showConfirmationModalSpy).toHaveBeenCalledWith(
        'Delete Application Profile',
        'Are you sure you want to delete Test Profile? This cannot be undone.',
        expect.any(Function),
      );
    });

    it('should call softDeleteOneApplicationProfile for non-deleted profile', () => {
      const appProfile = { id: '123', name: 'Test Profile', deletedAt: null } as ApplicationProfile;
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();
        return new Subscription();
      });

      component.deleteApplicationProfile(appProfile);

      expect(applicationProfileService.softDeleteOneApplicationProfile).toHaveBeenCalledWith({ id: '123' });
    });

    it('should call deleteOneApplicationProfile for already deleted profile', () => {
      const appProfile = { id: '123', name: 'Test Profile', deletedAt: new Date() } as any;
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();
        return new Subscription();
      });

      component.deleteApplicationProfile(appProfile);

      expect(applicationProfileService.deleteOneApplicationProfile).toHaveBeenCalledWith({ id: '123' });
    });
  });

  describe('restoreApplicationProfile', () => {
    it('should return early if profile is not deleted', () => {
      const appProfile = { id: '123', name: 'Test Profile', deletedAt: null } as ApplicationProfile;
      const showConfirmationModalSpy = jest.spyOn(component, 'showConfirmationModal' as any);

      component.restoreApplicationProfile(appProfile);

      expect(showConfirmationModalSpy).not.toHaveBeenCalled();
    });

    it('should show confirmation modal with correct message for deleted profile', () => {
      const appProfile = { id: '123', name: 'Test Profile', deletedAt: new Date() } as any;
      const showConfirmationModalSpy = jest.spyOn(component, 'showConfirmationModal' as any);

      component.restoreApplicationProfile(appProfile);

      expect(showConfirmationModalSpy).toHaveBeenCalledWith(
        'Restore Application Profile',
        'Are you sure you want to restore Test Profile?',
        expect.any(Function),
      );
    });

    it('should call restoreOneApplicationProfile when confirmed', () => {
      const appProfile = { id: '123', name: 'Test Profile', deletedAt: new Date() } as any;
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();
        return new Subscription();
      });

      component.restoreApplicationProfile(appProfile);

      expect(applicationProfileService.restoreOneApplicationProfile).toHaveBeenCalledWith({ id: '123' });
    });
  });

  describe('deprovisionApplicationProfile', () => {
    it('should show confirmation modal with correct message', () => {
      const appProfile = { id: '123', name: 'Test Profile' } as ApplicationProfile;
      const showConfirmationModalSpy = jest.spyOn(component, 'showConfirmationModal' as any);

      component.deprovisionApplicationProfile(appProfile);

      expect(showConfirmationModalSpy).toHaveBeenCalledWith(
        'Deprovision Application Profile',
        'Are you sure you would like to deprovision Test Profile?',
        expect.any(Function),
      );
    });

    it('should call deprovisionOneApplicationProfile when confirmed', () => {
      const appProfile = { id: '123', name: 'Test Profile' } as ApplicationProfile;
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();
        return new Subscription();
      });

      component.deprovisionApplicationProfile(appProfile);

      expect(applicationProfileService.deprovisionOneApplicationProfile).toHaveBeenCalledWith({ id: '123' });
    });
  });

  describe('importAppProfiles', () => {
    it('should show confirmation modal with correct message for single profile', () => {
      const event = [{ name: 'Application Profile 1' }] as any;
      const showConfirmationModalSpy = jest.spyOn(component, 'showConfirmationModal' as any);

      component.importAppProfiles(event);

      expect(showConfirmationModalSpy).toHaveBeenCalledWith(
        'Import Application Profiles',
        'Are you sure you would like to import 1 Application Profile?',
        expect.any(Function),
      );
    });

    it('should show confirmation modal with correct message for multiple profiles', () => {
      const event = [{ name: 'Application Profile 1' }, { name: 'Application Profile 2' }] as any;
      const showConfirmationModalSpy = jest.spyOn(component, 'showConfirmationModal' as any);

      component.importAppProfiles(event);

      expect(showConfirmationModalSpy).toHaveBeenCalledWith(
        'Import Application Profiles',
        'Are you sure you would like to import 2 Application Profiles?',
        expect.any(Function),
      );
    });

    it('should call createManyApplicationProfile when confirmed', () => {
      const event = [{ name: 'Application Profile 1' }, { name: 'Application Profile 2' }] as any;
      jest.spyOn(component, 'sanitizeData').mockReturnValue(event);
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();
        return new Subscription();
      });

      component.importAppProfiles(event);

      expect(applicationProfileService.createManyApplicationProfile).toHaveBeenCalledWith({
        createManyApplicationProfileDto: { bulk: event },
      });
    });
  });

  describe('openApplicationProfileModal', () => {
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
        resetModalData: jest.fn(),
      } as any;
    });

    describe('subscribeToApplicationProfileModal', () => {
      it('should subscribe to applicationProfileModal onCloseFinished event and unsubscribe afterwards', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);
        jest.spyOn(component, 'getApplicationProfiles');

        const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

        component.subscribeToApplicationProfileModal();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('applicationProfileModal');
        expect(component.applicationPofileModalSubscription).toBeDefined();

        onCloseFinished.next();

        expect(component.getApplicationProfiles).toHaveBeenCalled();
        expect(component['ngx'].resetModalData).toHaveBeenCalledWith('applicationProfileModal');
        expect(unsubscribeSpy).toHaveBeenCalled();
      });

      it('should apply search params when filtered results is true', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

        const getAppProfilesSpy = jest.spyOn(component, 'getApplicationProfiles');
        const params = { filteredResults: true, searchColumn: 'name', searchText: 'test', searchString: '' };
        jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

        component.subscribeToApplicationProfileModal();
        onCloseFinished.next();

        expect(getAppProfilesSpy).toHaveBeenCalledWith(params);
      });
    });

    it('should call ngx.setModalData and ngx.getModal().open', () => {
      const appProfile = { id: 1, name: 'Test App Profile' } as any;
      component.tenantId = '1';

      component.openApplicationProfileModal(ModalMode.Edit, appProfile);

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(ApplicationProfileModalDto), 'applicationProfileModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('applicationProfileModal');

      const modal = component['ngx'].getModal('applicationProfileModal');
      expect(modal).toBeDefined();
    });
  });
});
