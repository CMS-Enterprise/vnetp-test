import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppIdTableComponent } from './app-id-table.component';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AppIdRuntimeService } from '../app-id-runtime.service';
import { FirewallRule, PanosApplication } from '../../../../../client';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

describe('AppIdTableComponent', () => {
  let component: AppIdTableComponent;
  let fixture: ComponentFixture<AppIdTableComponent>;
  let mockAppIdService: jest.Mocked<AppIdRuntimeService>;
  let mockDialog: jest.Mocked<MatDialog>;

  const mockApplications: PanosApplication[] = [
    {
      id: '1',
      name: 'App1',
      panosId: 'app1',
      category: 'Network',
      subCategory: 'Firewall',
      risk: 'High',
      firewallRules: [],
    },
    {
      id: '2',
      name: 'App2',
      panosId: 'app2',
      category: 'Network',
      subCategory: 'VPN',
      risk: 'Medium',
      firewallRules: [{ id: 'rule1', name: 'Firewall Rule 1' }], // mock rule for testing
    },
  ] as any;

  const mockFirewallRule: FirewallRule = {
    id: 'rule1',
    name: 'Firewall Rule 1',
  } as any;

  beforeEach(async () => {
    mockAppIdService = {
      addPanosAppToFirewallRule: jest.fn(),
      removePanosAppFromFirewallRule: jest.fn(),
      getPanosApplications: jest.fn().mockReturnValue(of(mockApplications)),
    } as unknown as jest.Mocked<AppIdRuntimeService>;

    mockDialog = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatDialog>;

    await TestBed.configureTestingModule({
      declarations: [AppIdTableComponent],
      providers: [
        { provide: AppIdRuntimeService, useValue: mockAppIdService },
        { provide: MatDialog, useValue: mockDialog },
      ],
      imports: [MatTooltipModule, FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppIdTableComponent);
    component = fixture.componentInstance;
    component.applications = mockApplications;
    component.firewallRule = mockFirewallRule;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call addPanosAppToFirewallRule when adding an app', () => {
    const application = mockApplications[0];
    component.addPanosAppToFirewallRule(application);
    expect(mockAppIdService.addPanosAppToFirewallRule).toHaveBeenCalledWith(application, mockFirewallRule);
  });

  it('should call removePanosAppFromFirewallRule when removing an app', () => {
    const application = mockApplications[1];
    component.removePanosAppFromFirewallRule(application);
    expect(mockAppIdService.removePanosAppFromFirewallRule).toHaveBeenCalledWith(application, mockFirewallRule);
  });

  it('should filter applications based on search query', () => {
    component.searchQuery = 'App1';
    component.onSearch();
    expect(component.filteredApplications.length).toBe(1);
    expect(component.filteredApplications[0].name).toBe('App1');
  });

  it('should filter associated applications', () => {
    component.type = 'assocaited';
    component.onSearch();
    expect(component.filteredApplications.length).toBe(1);
    expect(component.filteredApplications[0].name).toBe('App2');
  });

  it('should filter available applications', () => {
    component.type = 'available';
    component.onSearch();
    expect(component.filteredApplications.length).toBe(1);
    expect(component.filteredApplications[0].name).toBe('App1');
  });

  it('should open the details dialog', () => {
    const application = mockApplications[0];
    component.openDetailsDialog(application);
    expect(mockDialog.open).toHaveBeenCalled();
  });
});
