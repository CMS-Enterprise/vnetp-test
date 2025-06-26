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
import { RouteProfileComponent } from './route-profile.component';
import { of, Subject, Subscription } from 'rxjs';
import { RouteProfile, V2AppCentricRouteProfilesService } from 'client';
import { RouteProfileModalDto } from 'src/app/models/appcentric/route-profile-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

describe('RouteProfilesComponent', () => {
  let component: RouteProfileComponent;
  let fixture: ComponentFixture<RouteProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        RouteProfileComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockImportExportComponent,
        MockIconButtonComponent,
        MockComponent({ selector: 'app-route-profile-modal', inputs: ['tenantId'] }),
        MockYesNoModalComponent,
      ],
      imports: [RouterTestingModule, HttpClientModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V2AppCentricRouteProfilesService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RouteProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('importRouteProfilesConfig', () => {
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
      const event = [{ name: 'Route Profile 1' }, { name: 'Route Profile 2' }] as any;
      const modalDto = new YesNoModalDto('Import Route Profiles', `Are you sure you would like to import ${event.length} Route Profiles?`);
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importRouteProfiles(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import route profiles and refresh the table on confirmation', () => {
      const event = [{ name: 'Route Profile 1' }, { name: 'Route Profile 2' }] as any;
      jest.spyOn(component, 'getRouteProfiles');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['routeProfileService'].createManyRouteProfile).toHaveBeenCalledWith({
          createManyRouteProfileDto: { bulk: component.sanitizeData(event) },
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

      component.importRouteProfiles(event);

      expect(component.getRouteProfiles).toHaveBeenCalled();
    });
  });

  it('should delete route profile', () => {
    const routeProfileToDelete = { id: '123', name: 'Test Route Profile', description: 'Bye!' } as any;
    const subscribeToYesNoModalSpy = jest
      .spyOn(SubscriptionUtil, 'subscribeToYesNoModal')
      .mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        // Just call onConfirm immediately for testing
        onConfirm();
        return new Subscription();
      });
    jest.spyOn(component['routeProfileService'], 'softDeleteOneRouteProfile').mockReturnValue(of({} as any));
    jest.spyOn(component as any, 'refreshRouteProfiles');

    component.deleteRouteProfile(routeProfileToDelete);

    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(component['routeProfileService'].softDeleteOneRouteProfile).toHaveBeenCalledWith({ id: '123' });
  });

  it('should restore route profile', () => {
    const routeProfile = { id: '1', name: 'Test Route Profile', deletedAt: true } as any;
    const subscribeToYesNoModalSpy = jest
      .spyOn(SubscriptionUtil, 'subscribeToYesNoModal')
      .mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        // Just call onConfirm immediately for testing
        onConfirm();
        return new Subscription();
      });
    jest.spyOn(component['routeProfileService'], 'restoreOneRouteProfile').mockReturnValue(of({} as any));
    jest.spyOn(component as any, 'refreshRouteProfiles');

    component.restoreRouteProfile(routeProfile);

    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(component['routeProfileService'].restoreOneRouteProfile).toHaveBeenCalledWith({ id: '1' });
  });

  it('should apply search params when filtered results is true', () => {
    const getRouteProfilesSpy = jest.spyOn(component, 'getRouteProfiles');
    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

    // Test refreshRouteProfiles helper method
    component['refreshRouteProfiles']();

    expect(getRouteProfilesSpy).toHaveBeenCalledWith(params);
  });

  describe('openRouteProfileModal', () => {
    describe('openModal', () => {
      beforeEach(() => {
        jest.spyOn(component, 'getRouteProfiles');
        jest.spyOn(component['ngx'], 'resetModalData');
      });

      it('should subscribe to routeProfileModal onCloseFinished event and unsubscribe afterwards', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

        const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

        component.subscribeToRouteProfileModal();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('routeProfileModal');
        expect(component.routeProfileModalSubscription).toBeDefined();

        onCloseFinished.next();

        expect(component.getRouteProfiles).toHaveBeenCalled();
        expect(component['ngx'].resetModalData).toHaveBeenCalledWith('routeProfileModal');

        expect(unsubscribeSpy).toHaveBeenCalled();
      });
      it('should call ngx.setModalData and ngx.getModal().open', () => {
        const routeProfile = { id: 1, name: 'Test Route Profile' } as any;
        component.tenantId = { id: '1' } as any;
        component.openRouteProfileModal(ModalMode.Edit, routeProfile);

        expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(RouteProfileModalDto), 'routeProfileModal');
        expect(component['ngx'].getModal).toHaveBeenCalledWith('routeProfileModal');

        const modal = component['ngx'].getModal('routeProfileModal');
        expect(modal).toBeDefined();
      });
    });
  });
});
