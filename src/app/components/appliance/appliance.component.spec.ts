import { ApplianceComponent } from './appliance.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockYesNoModalComponent,
  MockNgxSmartModalComponent,
  MockComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1DatacentersService, V1AppliancesService, Appliance } from 'api_client';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { EntityService } from 'src/app/services/entity.service';

describe('ApplianceComponent', () => {
  let component: ApplianceComponent;
  let fixture: ComponentFixture<ApplianceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        ApplianceComponent,
        MockComponent('app-appliance-modal'),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockYesNoModalComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        MockProvider(V1AppliancesService),
        MockProvider(V1DatacentersService),
        MockProvider(EntityService),
      ],
    });

    fixture = TestBed.createComponent(ApplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the create appliance modal', () => {
    const ngx = TestBed.inject(NgxSmartModalService) as any;
    const openSpy = jest.fn();
    jest.spyOn(ngx, 'getModal').mockImplementation(() => {
      return { onAnyCloseEvent: of(), open: openSpy };
    });

    const createButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    createButton.nativeElement.click();

    expect(openSpy).toHaveBeenCalled();
  });

  describe('Restore', () => {
    it('should not restore an appliance that is not deleted', () => {
      const appliance = {
        id: '1',
        deletedAt: undefined,
      } as Appliance;

      const applianceService = TestBed.inject(V1AppliancesService);
      const restoreSpy = jest.spyOn(applianceService, 'v1AppliancesIdRestorePatch');

      component.restoreAppliance(appliance);
      expect(restoreSpy).not.toHaveBeenCalled();
    });

    it('should restore an appliance that is deleted', () => {
      const appliance = {
        id: '1',
        deletedAt: {},
      } as Appliance;

      const applianceService = TestBed.inject(V1AppliancesService);
      const restoreSpy = jest.spyOn(applianceService, 'v1AppliancesIdRestorePatch');

      component.restoreAppliance(appliance);
      expect(restoreSpy).toHaveBeenCalledWith({ id: '1' });
    });
  });

  it('should delete an appliance', () => {
    const appliance = {
      id: '1',
      deletedAt: undefined,
    } as Appliance;

    const entityService = TestBed.inject(EntityService);
    const deleteSpy = jest.spyOn(entityService, 'deleteEntity');

    component.deleteAppliance(appliance);
    expect(deleteSpy).toHaveBeenCalled();
  });
});
