import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteTableModalComponent } from './route-table-modal.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { V1RuntimeDataRouteTableService } from '../../../../../../../client';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from '../../../../../../test/mock-components';
import { of } from 'rxjs';

describe('RouteTableModalComponent', () => {
  let component: RouteTableModalComponent;
  let fixture: ComponentFixture<RouteTableModalComponent>;
  let mockNgx: any;
  let formBuilder: FormBuilder;
  let mockRouteTableService: any;

  beforeEach(async () => {
    mockNgx = {
      close: jest.fn(),
      getModalData: jest.fn(),
      resetModalData: jest.fn(),
    };
    formBuilder = new FormBuilder();
    mockRouteTableService = {
      createOneRouteTable: jest.fn().mockReturnValue(of({})),
    };
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RouteTableModalComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgx },
        { provide: FormBuilder, useValue: formBuilder },
        { provide: V1RuntimeDataRouteTableService, useValue: mockRouteTableService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteTableModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the form', () => {
    const form = component.f;
    expect(form).toBeTruthy();
  });

  it('should close the modal and reset', () => {
    const resetSpy = jest.spyOn(component, 'reset').mockImplementation(() => {});
    component.closeModal();
    expect(mockNgx.close).toHaveBeenCalled();
    expect(resetSpy).toHaveBeenCalled();
  });

  it('should get modal data', () => {
    jest.spyOn(mockNgx, 'getModalData').mockReturnValue({ wanFormId: 'id' });
    component.getData();
    expect(component.wanFormId).toBe('id');
    expect(mockNgx.resetModalData).toHaveBeenCalled();
  });

  it('should reset the form', () => {
    component.submitted = true;
    component.reset();
    expect(component.submitted).toBeFalsy();
    expect(mockNgx.resetModalData).toHaveBeenCalled();
  });

  describe('save', () => {
    it('should not save if form is invalid', () => {
      const createOneSpy = jest.spyOn(mockRouteTableService, 'createOneRouteTable');
      component.form.controls.network.setErrors({ incorrect: true });
      component.save();
      expect(createOneSpy).not.toHaveBeenCalled();
    });

    it('should save', () => {
      component.form.setValue({ network: '192.168.0.1', prefixLength: 20, metric: 1, vrf: 'vrf' });
      const createOneSpy = jest.spyOn(mockRouteTableService, 'createOneRouteTable');
      component.save();
      expect(createOneSpy).toHaveBeenCalled();
    });
  });
});
