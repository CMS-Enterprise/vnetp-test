import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
import { Subscription } from 'rxjs';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { V2AppCentricRouteProfilesService } from 'client';

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
      jest.spyOn(component, 'getRouteProfile');
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

      expect(component.getRouteProfile).toHaveBeenCalled();
    });
  });
});
