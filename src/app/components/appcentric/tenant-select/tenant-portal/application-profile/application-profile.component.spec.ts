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
import { Subscription } from 'rxjs';
import { V2AppCentricApplicationProfilesService, V2AppCentricEndpointGroupsService } from 'client';

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
});
