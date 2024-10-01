import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIdRuntimeComponent } from './app-id-runtime.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AppIdRuntimeService } from './app-id-runtime.service';
import { AppIdRuntimeModule } from './app-id-runtime.module';
import { of } from 'rxjs';

describe('AppIdRuntimeComponent', () => {
  let component: AppIdRuntimeComponent;
  let fixture: ComponentFixture<AppIdRuntimeComponent>;
  let mockAppIdRuntimeService: jest.Mocked<AppIdRuntimeService>;
  let mockNgxSmartModalService: jest.Mocked<NgxSmartModalService>;

  beforeEach(async () => {
    mockAppIdRuntimeService = {
      removePanosApplicationFromDto: jest.fn(),
      addPanosApplicationToDto: jest.fn(),
      resetDto: jest.fn(),
      isDtoEmpty: jest.fn(),
      getPanosApplications: jest.fn(),
    } as any;
    mockNgxSmartModalService = {
      close: jest.fn(),
      getModalData: jest.fn(),
      setModalData: jest.fn(),
      getModal: jest.fn().mockReturnValue({ open: jest.fn(), onCloseFinished: of({ getData: jest.fn(), removeData: jest.fn() }) }),
    } as any;

    await TestBed.configureTestingModule({
      imports: [AppIdRuntimeModule],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: AppIdRuntimeService, useValue: mockAppIdRuntimeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppIdRuntimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should getAssociatedApplications', () => {
    const mockApplications = [
      { firewallRules: [{ id: 1 }, { id: 2 }] },
      { firewallRules: [{ id: 2 }, { id: 3 }] },
      { firewallRules: [{ id: 3 }, { id: 4 }] },
    ];
    component.firewallRule = { id: 2 } as any;
    component.panosApplications = mockApplications as any;
    component.getAssociatedApplications();
    expect(component.associatedApplications).toEqual([
      { firewallRules: [{ id: 1 }, { id: 2 }] },
      { firewallRules: [{ id: 2 }, { id: 3 }] },
    ]);
  });

  it('should getAvailableApplications', () => {
    const mockApplications = [
      { firewallRules: [{ id: 1 }, { id: 2 }] },
      { firewallRules: [{ id: 2 }, { id: 3 }] },
      { firewallRules: [{ id: 3 }, { id: 4 }] },
    ];
    component.firewallRule = { id: 2 } as any;
    component.panosApplications = mockApplications as any;
    component.getAvailableApplications();
    expect(component.availableApplications).toEqual([{ firewallRules: [{ id: 3 }, { id: 4 }] }]);
  });

  it('should save', () => {
    component.saveClose = true;
    component.save();
    expect(component.saveClose).toBe(false);
  });

  describe('closeModal', () => {
    it('should do nothing if saveClose is true', () => {
      component.saveClose = true;
      component.closeModal();
      expect(mockAppIdRuntimeService.removePanosApplicationFromDto).not.toHaveBeenCalled();
      expect(mockAppIdRuntimeService.addPanosApplicationToDto).not.toHaveBeenCalled();
      expect(mockAppIdRuntimeService.resetDto).not.toHaveBeenCalled();
    });

    it('should close modal if dto is empty and saveClose is false', () => {
      mockAppIdRuntimeService.isDtoEmpty.mockReturnValue(true);
      component.saveClose = false;
      component.closeModal();
      expect(mockAppIdRuntimeService.removePanosApplicationFromDto).not.toHaveBeenCalled();
      expect(mockAppIdRuntimeService.addPanosApplicationToDto).not.toHaveBeenCalled();
      expect(mockAppIdRuntimeService.resetDto).not.toHaveBeenCalled();
      expect(mockNgxSmartModalService.close).toHaveBeenCalledWith('appIdModal');
    });

    it('should show yes no modal if dto is not empty and saveClose is false', () => {
      mockAppIdRuntimeService.isDtoEmpty.mockReturnValue(false);
      component.saveClose = false;
      component.closeModal();
      expect(mockAppIdRuntimeService.removePanosApplicationFromDto).not.toHaveBeenCalled();
      expect(mockAppIdRuntimeService.addPanosApplicationToDto).not.toHaveBeenCalled();
      expect(mockAppIdRuntimeService.resetDto).not.toHaveBeenCalled();
      expect(mockNgxSmartModalService.close).not.toHaveBeenCalled();
    });
  });

  it('should getData', () => {
    const mockDto = { tier: { appVersion: 'panos' }, firewallRule: {} };
    const mockApplications = [{ firewallRules: [] }] as any;
    mockNgxSmartModalService.getModalData.mockReturnValue(mockDto);
    mockAppIdRuntimeService.getPanosApplications.mockReturnValue(of(mockApplications));
    component.getData();
    expect(component.tier).toEqual(mockDto.tier);
    expect(component.firewallRule).toEqual(mockDto.firewallRule);
    expect(component.panosApplications).toEqual(mockApplications);
  });
});
