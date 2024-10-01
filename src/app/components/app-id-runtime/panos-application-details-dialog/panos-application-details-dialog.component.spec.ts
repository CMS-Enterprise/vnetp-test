import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { PanosApplication } from '../../../../../client';
import { PanosApplicationDetailsDialogComponent } from './panos-application-details-dialog.component';

describe('PanosApplicationDetailsDialogComponent', () => {
  let component: PanosApplicationDetailsDialogComponent;
  let fixture: ComponentFixture<PanosApplicationDetailsDialogComponent>;
  let debugElement: DebugElement;

  const mockPanosApplication: PanosApplication = {
    id: '1',
    panosId: 'app123',
    appVersion: '9.1',
    minver: '8.0',
    name: 'Test Application',
    oriCountry: 'USA',
    oriLanguage: 'English',
    category: 'Network',
    subCategory: 'Firewall',
    technology: 'Tech',
    virusIdent: true,
    evasiveBehavior: false,
    consumeBigBandwidth: true,
    usedByMalware: false,
    ableToTransferFile: true,
    hasKnownVulnerability: false,
    tunnelOtherApplication: false,
    proneToMisuse: false,
    pervasiveUse: true,
    references: [] as any,
    useApplicationsMembers: [],
    defaultPortMember: '8080',
    identByIpProtocol: 'IP',
    risk: 'High',
    firewallRules: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PanosApplicationDetailsDialogComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: mockPanosApplication }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PanosApplicationDetailsDialogComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with dialog data if no input data is provided', () => {
    // Simulate dialog mode without @Input data
    component.data = null;
    component.ngOnInit();
    expect(component.data).toEqual(mockPanosApplication);
  });

  it('should use @Input data if provided', () => {
    // Simulate component mode with @Input data
    const customData: PanosApplication = { ...mockPanosApplication, name: 'Custom App' };
    component.data = customData;
    component.ngOnInit();
    expect(component.data).toEqual(customData);
  });

  it('should render the application name in the title', () => {
    component.data = mockPanosApplication;
    fixture.detectChanges();

    const titleElement = debugElement.query(By.css('.details-title')).nativeElement;
    expect(titleElement.textContent).toContain(mockPanosApplication.name);
  });
});
