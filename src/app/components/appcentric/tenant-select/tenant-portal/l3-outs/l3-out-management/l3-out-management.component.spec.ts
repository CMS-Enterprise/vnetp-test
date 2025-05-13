/* eslint-disable @typescript-eslint/dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { L3OutManagementComponent } from './l3-out-management.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  V2AppCentricL3outsService,
  V2AppCentricBridgeDomainsService,
  V2AppCentricEndpointGroupsService,
  V2AppCentricEndpointSecurityGroupsService,
  V2AppCentricAppCentricSubnetsService,
  BridgeDomain,
} from '../../../../../../../../client';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockFontAwesomeComponent } from '../../../../../../../test/mock-components';

interface BridgeDomainWithAssociations extends BridgeDomain {
  epgs: any[];
  esgs: any[];
  expanded?: boolean;
}

describe('L3OutManagementComponent', () => {
  let component: L3OutManagementComponent;
  let fixture: ComponentFixture<L3OutManagementComponent>;
  let mockL3OutsService: jest.Mocked<V2AppCentricL3outsService>;
  let mockBridgeDomainService: jest.Mocked<V2AppCentricBridgeDomainsService>;
  let mockEpgService: jest.Mocked<V2AppCentricEndpointGroupsService>;
  let mockEsgService: jest.Mocked<V2AppCentricEndpointSecurityGroupsService>;
  let mockAppcentricSubnetService: jest.Mocked<V2AppCentricAppCentricSubnetsService>;
  let mockDialog: jest.Mocked<MatDialog>;

  const mockL3Out = {
    id: 'l3out-1',
    name: 'Test L3Out',
    vrfId: 'vrf-1',
    endpointGroups: [],
    endpointSecurityGroups: [],
  };

  const mockBridgeDomain: BridgeDomainWithAssociations = {
    id: 'bd-1',
    name: 'Test BD',
    subnets: [
      {
        id: 'subnet-1',
        gatewayIp: '10.0.0.1',
        advertisedExternally: false,
        treatAsVirtualIpAddress: false,
        primaryIpAddress: false,
        preferred: false,
        sharedBetweenVrfs: false,
        ipDataPlaneLearning: true,
        tenantId: 'tenant-1',
        bridgeDomainId: 'bd-1',
      },
      {
        id: 'subnet-2',
        gatewayIp: '10.0.0.2',
        advertisedExternally: true,
        treatAsVirtualIpAddress: false,
        primaryIpAddress: false,
        preferred: false,
        sharedBetweenVrfs: false,
        ipDataPlaneLearning: true,
        tenantId: 'tenant-1',
        bridgeDomainId: 'bd-1',
      },
    ],
    epgs: [
      { id: 'epg-1', name: 'Test EPG 1', bridgeDomainId: 'bd-1' },
      { id: 'epg-2', name: 'Test EPG 2', bridgeDomainId: 'bd-1' },
    ],
    esgs: [
      {
        id: 'esg-1',
        name: 'Test ESG 1',
        selectors: [{ endpointGroupId: 'epg-1', endpointSecurityGroupId: 'esg-1', tenantId: 'tenant-1' }],
      },
      {
        id: 'esg-2',
        name: 'Test ESG 2',
        selectors: [{ endpointGroupId: 'epg-2', endpointSecurityGroupId: 'esg-2', tenantId: 'tenant-1' }],
      },
    ],
    unicastRouting: true,
    arpFlooding: false,
    hostBasedRouting: false,
    bdMacAddress: '00:00:00:00:00:00',
    tenantId: 'tenant-1',
    vrfId: 'vrf-1',
    limitLocalIpLearning: false,
    epMoveDetectionModeGarp: false,
    alias: '',
    description: '',
  };

  beforeEach(async () => {
    mockL3OutsService = {
      getOneL3Out: jest.fn().mockReturnValue(of(mockL3Out)),
      addEndpointGroupToL3OutL3Out: jest.fn().mockReturnValue(of({})),
      removeEpgFromL3OutL3Out: jest.fn().mockReturnValue(of({})),
      addEndpointSecurityGroupToL3OutL3Out: jest.fn().mockReturnValue(of({})),
      removeEndpointSecurityGroupFromL3OutL3Out: jest.fn().mockReturnValue(of({})),
    } as any;

    mockBridgeDomainService = {
      getManyBridgeDomain: jest.fn().mockReturnValue(of([mockBridgeDomain])),
    } as any;

    mockEpgService = {
      getManyEndpointGroup: jest.fn().mockReturnValue(of({ data: mockBridgeDomain.epgs })),
    } as any;

    mockEsgService = {
      getManyEndpointSecurityGroup: jest.fn().mockReturnValue(of({ data: mockBridgeDomain.esgs })),
    } as any;

    mockAppcentricSubnetService = {
      updateOneAppCentricSubnet: jest.fn().mockReturnValue(of({})),
    } as any;

    mockDialog = {
      open: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [L3OutManagementComponent, MockFontAwesomeComponent],
      providers: [
        FormBuilder,
        { provide: V2AppCentricL3outsService, useValue: mockL3OutsService },
        { provide: V2AppCentricBridgeDomainsService, useValue: mockBridgeDomainService },
        { provide: V2AppCentricEndpointGroupsService, useValue: mockEpgService },
        { provide: V2AppCentricEndpointSecurityGroupsService, useValue: mockEsgService },
        { provide: V2AppCentricAppCentricSubnetsService, useValue: mockAppcentricSubnetService },
        { provide: MatDialog, useValue: mockDialog },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: (param: string) => {
                if (param === 'tenantId') {
                  return 'tenant-1';
                }
                if (param === 'id') {
                  return 'l3out-1';
                }
                return null;
              },
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(L3OutManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load L3Out data on init', () => {
    expect(mockL3OutsService.getOneL3Out).toHaveBeenCalledWith({
      id: 'l3out-1',
      relations: ['vrf', 'bridgeDomains', 'endpointGroups', 'endpointSecurityGroups'],
    });
  });

  it('should build form with correct initial values', () => {
    component.bridgeDomains = [mockBridgeDomain];
    component.buildForm();

    const bdForm = component.form.get(mockBridgeDomain.id);
    expect(bdForm).toBeTruthy();

    const subnetsForm = bdForm?.get('subnets');
    expect(subnetsForm?.get('0')?.get('advertisedExternally')?.value).toBe(false);
    expect(subnetsForm?.get('1')?.get('advertisedExternally')?.value).toBe(true);
  });

  it('should detect changes in bridge domain', () => {
    component.bridgeDomains = [mockBridgeDomain];
    component.buildForm();

    const bdForm = component.form.get(mockBridgeDomain.id);
    const subnetsForm = bdForm?.get('subnets');

    // Initially no changes
    expect(component.hasBridgeDomainChanges(mockBridgeDomain)).toBe(false);

    // Change a value
    subnetsForm?.get('0')?.get('advertisedExternally')?.setValue(true);
    expect(component.hasBridgeDomainChanges(mockBridgeDomain)).toBe(true);

    // Change back to original value
    subnetsForm?.get('0')?.get('advertisedExternally')?.setValue(false);
    expect(component.hasBridgeDomainChanges(mockBridgeDomain)).toBe(false);
  });

  describe('applyOneChange', () => {
    it('should apply changes correctly', () => {
      component.bridgeDomains = [mockBridgeDomain];
      component.buildForm();

      const bdForm = component.form.get(mockBridgeDomain.id);
      const subnetsForm = bdForm?.get('subnets');

      // Change a subnet's advertisedExternally value
      subnetsForm?.get('0')?.get('advertisedExternally')?.setValue(true);

      component.applyOneChange(mockBridgeDomain);

      expect(mockAppcentricSubnetService.updateOneAppCentricSubnet).toHaveBeenCalledWith({
        id: 'subnet-1',
        appCentricSubnet: expect.objectContaining({
          id: 'subnet-1',
          advertisedExternally: true,
        }),
      });
    });

    it('should log error if bd id does not exist in form', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      component.applyOneChange({ ...mockBridgeDomain, id: 'fake-id' } as any);
      expect(consoleSpy).toHaveBeenCalledWith('Bridge Domain form not found');
      consoleSpy.mockRestore();
    });
  });

  it('should check if bridge domain has data', () => {
    const bdWithData = { ...mockBridgeDomain };
    const bdWithoutData = {
      ...mockBridgeDomain,
      id: 'bd-2',
      name: 'Empty BD',
      subnets: [],
      epgs: [],
      esgs: [],
    };

    expect(component.hasData(bdWithData)).toBe(true);
    expect(component.hasData(bdWithoutData)).toBe(false);
  });

  it('should toggle bridge domain expansion', () => {
    const bd = { ...mockBridgeDomain, expanded: false };
    component.toggleExpand(bd);
    expect(bd.expanded).toBe(true);

    component.toggleExpand(bd);
    expect(bd.expanded).toBe(false);
  });

  it('should apply all changes', () => {
    component.bridgeDomains = [mockBridgeDomain];
    component.buildForm();
    jest.spyOn(component, 'applyOneChange').mockImplementation(() => of({}));
    jest.spyOn(component, 'hasBridgeDomainChanges').mockReturnValue(true);
    component.applyAllChanges();
    expect(component.applyOneChange).toHaveBeenCalledWith(mockBridgeDomain, true);
  });

  describe('allowsConnection', () => {
    it('should return true if l3out has epg', () => {
      component.l3Out = { ...mockL3Out, endpointGroups: [{ id: 'epg-1' }] } as any;
      expect(component['allowsConnection']('epg-1')).toBe(true);
    });

    it('should return true if l3out has esg', () => {
      component.l3Out = { ...mockL3Out, endpointSecurityGroups: [{ id: 'esg-1' }] } as any;
      expect(component['allowsConnection']('esg-1')).toBe(true);
    });

    it('should return false if l3out does not have epg or esg', () => {
      component.l3Out = { ...mockL3Out, endpointGroups: [], endpointSecurityGroups: [] } as any;
      expect(component['allowsConnection']('epg-1')).toBe(false);
      expect(component['allowsConnection']('esg-1')).toBe(false);
    });
  });

  it('openChangePreview should call applyOneChange', () => {
    const applyOneChangeSpy = jest.spyOn(component, 'applyOneChange');
    component.openChangePreview(mockBridgeDomain);
    expect(applyOneChangeSpy).toHaveBeenCalledWith(mockBridgeDomain);
  });

  describe('hasBridgeDomainChanges', () => {
    it('should return false if bridge domain doesnt exist in form', () => {
      const bd = { ...mockBridgeDomain, id: 'fake-id' };
      expect(component.hasBridgeDomainChanges(bd)).toBe(false);
    });

    it('should return true if it has epg changes', () => {
      const bdForm = component.form.get(mockBridgeDomain.id);
      const epgsForm = bdForm?.get('epgs');
      epgsForm?.get('0')?.get('allowComm')?.setValue(true);

      expect(component.hasBridgeDomainChanges(mockBridgeDomain)).toBe(true);
    });

    it('should return true if it has esg changes', () => {
      const bdForm = component.form.get(mockBridgeDomain.id);
      const esgsForm = bdForm?.get('esgs');
      esgsForm?.get('0')?.get('allowComm')?.setValue(true);
      expect(component.hasBridgeDomainChanges(mockBridgeDomain)).toBe(true);
    });
  });
});
