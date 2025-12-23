import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { GlobalBgpAsnRangeModalComponent } from './global-bgp-asn-range-modal.component';
import { V3GlobalEnvironmentsService, V3GlobalBgpRangesService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';

describe('GlobalBgpAsnRangeModalComponent', () => {
  let component: GlobalBgpAsnRangeModalComponent;
  let fixture: ComponentFixture<GlobalBgpAsnRangeModalComponent>;

  let mockEnv: any;
  let mockBgp: any;
  let mockNgx: any;

  beforeEach(async () => {
    mockEnv = {
      getManyEnvironments: jest.fn().mockReturnValue(of([{ id: 'e1', name: 'Env 1' }])),
    } as Partial<V3GlobalEnvironmentsService> as any;

    mockBgp = {
      createGlobalBgpAsn: jest.fn().mockReturnValue(of({})),
      updateGlobalBgpAsn: jest.fn().mockReturnValue(of({})),
    } as Partial<V3GlobalBgpRangesService> as any;

    mockNgx = {
      getModalData: jest.fn().mockReturnValue({}),
      resetModalData: jest.fn(),
      close: jest.fn(),
    } as Partial<NgxSmartModalService> as any;

    await TestBed.configureTestingModule({
      declarations: [GlobalBgpAsnRangeModalComponent],
      providers: [
        FormBuilder,
        { provide: V3GlobalEnvironmentsService, useValue: mockEnv },
        { provide: V3GlobalBgpRangesService, useValue: mockBgp },
        { provide: NgxSmartModalService, useValue: mockNgx },
      ],
      imports: [FormsModule, ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalBgpAsnRangeModalComponent);
    component = fixture.componentInstance;
  });

  it('ngOnInit builds form and loads environments', () => {
    fixture.detectChanges();
    expect(component.form).toBeTruthy();
    expect(mockEnv.getManyEnvironments).toHaveBeenCalled();
    expect(component.environments).toEqual([{ id: 'e1', name: 'Env 1' }]);
  });

  it('ngOnDestroy unsubscribes from start autofill', () => {
    fixture.detectChanges();
    const sub = { unsubscribe: jest.fn() } as any;
    (component as any).startAutoSub = sub;
    component.ngOnDestroy();
    expect(sub.unsubscribe).toHaveBeenCalled();
  });

  it('getData in Create mode resets form and clears modal data', () => {
    fixture.detectChanges();
    mockNgx.getModalData.mockReturnValueOnce({});
    const prev = component.form;
    component.getData();
    expect(component.mode).toBe(ModalMode.Create);
    expect(component.editingRange).toBeNull();
    expect(mockNgx.resetModalData).toHaveBeenCalledWith('globalBgpAsnRangeModal');
    // New form instance
    expect(component.form).not.toBe(prev);
  });

  it('getData in Edit mode patches form, disables fields and clears modal data', () => {
    fixture.detectChanges();
    const range = {
      id: 'id1',
      name: 'R-1',
      environmentId: 'e1',
      start: 100000,
      end: 100200,
      type: 'Internal',
      description: 'desc',
    } as any;
    mockNgx.getModalData.mockReturnValueOnce({ ModalMode: ModalMode.Edit, range });
    component.getData();
    expect(component.mode).toBe(ModalMode.Edit);
    expect(component.editingRange?.id).toBe('id1');
    expect(component.form.get('name')?.disabled).toBe(true);
    expect(component.form.get('environmentId')?.disabled).toBe(true);
    expect(mockNgx.resetModalData).toHaveBeenCalledWith('globalBgpAsnRangeModal');
  });

  it('start->end autofill suggests +100 when Create mode and end pristine', () => {
    fixture.detectChanges();
    component.mode = ModalMode.Create;
    component.displayFormat = 'asplain';
    component.form.get('endAsPlain')?.markAsPristine();
    component.form.get('startAsPlain')?.setValue(70000);
    expect(component.form.get('endAsPlain')?.value).toBe(70100);
  });

  it('start->end autofill does not override when end dirty, or in Edit mode, or NaN', () => {
    fixture.detectChanges();
    component.displayFormat = 'asplain';
    // Dirty end
    component.mode = ModalMode.Create;
    component.form.get('endAsPlain')?.markAsDirty();
    component.form.get('startAsPlain')?.setValue(71000);
    expect(component.form.get('endAsPlain')?.value).not.toBe(71100);

    // Edit mode
    component.mode = ModalMode.Edit;
    component.form.get('endAsPlain')?.markAsPristine();
    component.form.get('startAsPlain')?.setValue(72000);
    expect(component.form.get('endAsPlain')?.value).not.toBe(72100);

    // NaN
    component.mode = ModalMode.Create;
    component.form.get('endAsPlain')?.markAsPristine();
    component.form.get('startAsPlain')?.setValue('bad');
    expect(component.form.get('endAsPlain')?.value).not.toBeNaN();
  });

  it('save invalid marks active format controls as touched and returns', () => {
    fixture.detectChanges();
    component.displayFormat = 'asplain';
    const startSpy = jest.spyOn(component.form.get('startAsPlain')!, 'markAsTouched');
    const endSpy = jest.spyOn(component.form.get('endAsPlain')!, 'markAsTouched');
    const nameSpy = jest.spyOn(component.form.get('name')!, 'markAsTouched');
    const envSpy = jest.spyOn(component.form.get('environmentId')!, 'markAsTouched');
    // Leave required empty
    component.save();
    expect(startSpy).toHaveBeenCalled();
    expect(endSpy).toHaveBeenCalled();
    expect(nameSpy).toHaveBeenCalled();
    expect(envSpy).toHaveBeenCalled();
    expect(mockBgp.createGlobalBgpAsn).not.toHaveBeenCalled();
  });

  it('save enforces start <= end', () => {
    fixture.detectChanges();
    component.displayFormat = 'asplain';
    component.form.patchValue({
      name: 'R',
      environmentId: 'e1',
      startAsPlain: 90000,
      endAsPlain: 80000,
    });
    component.save();
    const endCtrl = component.form.get('endAsPlain');
    expect(endCtrl?.errors?.minRange).toBe(true);
    expect(mockBgp.createGlobalBgpAsn).not.toHaveBeenCalled();
  });

  it('save Create mode calls create service and closes', () => {
    fixture.detectChanges();
    component.mode = ModalMode.Create;
    component.displayFormat = 'asplain';
    component.form.patchValue({
      name: 'Range',
      environmentId: 'e1',
      startAsPlain: 80000,
      endAsPlain: 80050,
      description: 'desc',
    });
    const closeSpy = jest.spyOn(component, 'close');
    component.save();
    expect(mockBgp.createGlobalBgpAsn).toHaveBeenCalledWith({
      createGlobalBgpRangeDto: expect.objectContaining({ name: 'Range', environmentId: 'e1', start: '80000', end: '80050' }),
    });
    expect(closeSpy).toHaveBeenCalled();
  });

  it('save Update mode with id calls update service and closes', () => {
    fixture.detectChanges();
    component.mode = ModalMode.Edit;
    component.displayFormat = 'asplain';
    (component as any).editingRange = { id: 'rid' } as any;
    component.form.patchValue({
      name: 'RangeX',
      environmentId: 'e2',
      startAsPlain: 81000,
      endAsPlain: 81050,
      description: 'new',
    });
    const closeSpy = jest.spyOn(component, 'close');
    component.save();
    expect(mockBgp.updateGlobalBgpAsn).toHaveBeenCalledWith({
      id: 'rid',
      updateGlobalBgpRangeDto: expect.objectContaining({ start: '81000', end: '81050', description: 'new' }),
    });
    expect(closeSpy).toHaveBeenCalled();
  });

  it('save Update mode without id simply closes', () => {
    fixture.detectChanges();
    component.mode = ModalMode.Edit;
    component.displayFormat = 'asplain';
    (component as any).editingRange = null;
    const closeSpy = jest.spyOn(component, 'close');
    component.form.patchValue({ name: 'R', environmentId: 'e1', startAsPlain: 82000, endAsPlain: 82010 });
    component.save();
    expect(mockBgp.updateGlobalBgpAsn).not.toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('close invokes modal close on correct identifier', () => {
    fixture.detectChanges();
    component.close();
    expect(mockNgx.close).toHaveBeenCalledWith('globalBgpAsnRangeModal');
  });
});
