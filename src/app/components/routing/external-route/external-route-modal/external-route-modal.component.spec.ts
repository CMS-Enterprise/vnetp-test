import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from '../../../../../test/mock-components';
import { V2RoutingExternalRoutesService } from '../../../../../../client';
import { ExternalRouteModalComponent } from './external-route-modal.component';

describe('ExternalRouteModalComponent', () => {
  let component: ExternalRouteModalComponent;
  let fixture: ComponentFixture<ExternalRouteModalComponent>;
  let mockNgx: any;
  let formBuilder: FormBuilder;
  let mockExternalRouteService: any;

  beforeEach(async () => {
    mockNgx = {
      close: jest.fn(),
      getModalData: jest.fn(),
      resetModalData: jest.fn(),
    };
    formBuilder = new FormBuilder();
    mockExternalRouteService = {
      createOneExternalRoute: jest.fn().mockReturnValue(of({})),
    };
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ExternalRouteModalComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgx },
        { provide: FormBuilder, useValue: formBuilder },
        { provide: V2RoutingExternalRoutesService, useValue: mockExternalRouteService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalRouteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit builds the form', () => {
    const spy = jest.spyOn(component as any, 'buildForm');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should get the form controls via getter', () => {
    const form = component.f;
    expect(form).toBeTruthy();
    expect('network' in form).toBe(true);
    expect('externalVrf' in form).toBe(true);
  });

  it('buildForm creates controls with validators', () => {
    (component as any).buildForm();
    const networkCtrl = component.form.get('network');
    const externalVrfCtrl = component.form.get('externalVrf');
    expect(networkCtrl).toBeTruthy();
    expect(externalVrfCtrl).toBeTruthy();

    // required validation
    networkCtrl?.setValue('');
    externalVrfCtrl?.setValue('');
    expect(networkCtrl?.valid).toBe(false);
    expect(externalVrfCtrl?.valid).toBe(false);

    networkCtrl?.setValue('10.0.0.1');
    externalVrfCtrl?.setValue('VRF_A');
    expect(networkCtrl?.valid).toBe(true);
    expect(externalVrfCtrl?.valid).toBe(true);
  });

  it('should close the modal and reset', () => {
    const resetSpy = jest.spyOn(component, 'reset').mockImplementation(() => {});
    component.closeModal();
    expect(mockNgx.close).toHaveBeenCalledWith('externalRouteModal');
    expect(resetSpy).toHaveBeenCalled();
  });

  it('getData sets connection and tenant IDs and resets modal data', () => {
    jest.spyOn(mockNgx, 'getModalData').mockReturnValue({ externalVrfConnectionId: 'id', tenantId: 'tenant-1' });
    component.getData();
    expect(component.externalVrfConnectionId).toBe('id');
    expect(component.tenantId).toBe('tenant-1');
    expect(mockNgx.resetModalData).toHaveBeenCalledWith('externalRouteModal');
  });

  it('reset clears submitted, resets data and rebuilds form', () => {
    component.submitted = true;
    const spyBuild = jest.spyOn(component as any, 'buildForm');
    component.reset();
    expect(component.submitted).toBe(false);
    expect(mockNgx.resetModalData).toHaveBeenCalledWith('externalRouteModal');
    expect(spyBuild).toHaveBeenCalled();
  });

  describe('save', () => {
    it('does not save if form is invalid', () => {
      const createOneSpy = jest.spyOn(mockExternalRouteService, 'createOneExternalRoute');
      component.form.controls.network.setValue('');
      component.form.controls.externalVrf.setValue('');
      component.save();
      expect(createOneSpy).not.toHaveBeenCalled();
    });

    it('saves with correct payload and closes modal', () => {
      // set IDs as they are sourced from modal data normally
      component.externalVrfConnectionId = 'conn-1';
      component.tenantId = 'tenant-1';
      const spyClose = jest.spyOn(component, 'closeModal');

      component.form.setValue({ network: '10.0.0.1', externalVrf: 'VRF_A' });
      component.save();

      expect(mockExternalRouteService.createOneExternalRoute).toHaveBeenCalledWith({
        externalRoute: {
          network: '10.0.0.1',
          externalVrf: 'VRF_A',
          externalVrfConnectionId: 'conn-1',
          tenantId: 'tenant-1',
        },
      });
      expect(spyClose).toHaveBeenCalled();
    });
  });
});
