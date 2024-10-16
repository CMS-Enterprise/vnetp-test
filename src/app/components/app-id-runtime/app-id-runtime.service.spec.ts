import { TestBed } from '@angular/core/testing';

import { AppIdRuntimeService } from './app-id-runtime.service';
import { AppIdRuntimeModule } from './app-id-runtime.module';
import { V1NetworkSecurityFirewallRulesService, V1RuntimeDataAppIdRuntimeService } from '../../../../client';
import { of } from 'rxjs';

describe('AppIdRuntimeService', () => {
  let service: AppIdRuntimeService;
  let mockAppIdService: jest.Mocked<V1RuntimeDataAppIdRuntimeService>;
  let mockFirewallRuleService: jest.Mocked<V1NetworkSecurityFirewallRulesService>;

  beforeEach(() => {
    mockAppIdService = {
      getManyAppIdRuntime: jest.fn(),
      getPanosApplication: jest.fn(),
      addPanosApplication: jest.fn(),
      updatePanosApplication: jest.fn(),
      deletePanosApplication: jest.fn(),
    } as any;

    mockFirewallRuleService = {
      modifyPanosApplicationsFirewallRule: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AppIdRuntimeModule,
        { provide: V1RuntimeDataAppIdRuntimeService, useValue: mockAppIdService },
        { provide: V1NetworkSecurityFirewallRulesService, useValue: mockFirewallRuleService },
      ],
    });
    service = TestBed.inject(AppIdRuntimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadPanosApplications', () => {
    it('should do nothing if applications are loaded', () => {
      (service as any).panosApplicationsSubject = { getValue: jest.fn().mockReturnValue(new Map([['1', [1]]])) };
      service.loadPanosApplications('1');
      expect(mockAppIdService.getManyAppIdRuntime).not.toHaveBeenCalled();
    });

    it('should fetch applications if not loaded', () => {
      (service as any).panosApplicationsSubject = { getValue: jest.fn().mockReturnValue(new Map()) };
      mockAppIdService.getManyAppIdRuntime.mockReturnValue(of({} as any));
      service.loadPanosApplications('1');
      expect(mockAppIdService.getManyAppIdRuntime).toHaveBeenCalledWith({
        filter: ['appVersion||eq||1'],
        relations: ['firewallRules'],
        perPage: 10000,
      });
    });
  });

  it('should modify application data', () => {
    (service as any).panosApplicationsSubject = { getValue: jest.fn().mockReturnValue(new Map([['1', [1]]])), next: jest.fn() };
    service.modifyApplicationData({ id: 1 } as any, '1');
    expect((service as any).panosApplicationsSubject.next).toHaveBeenCalledWith(new Map([['1', [1]]]));
  });

  describe('addPanosApplicationToDto', () => {
    it('should add application to dto', () => {
      service.addPanosApplicationToDto({ id: 1 } as any);
      expect((service as any).dto.panosApplicationsToAdd).toEqual([{ id: 1 }]);
    });

    it('should remove application from dto', () => {
      (service as any).dto.panosApplicationsToRemove = [{ id: 1 }];
      service.addPanosApplicationToDto({ id: 1 } as any);
      expect((service as any).dto.panosApplicationsToRemove).toEqual([]);
    });
  });

  describe('removePanosApplicationFromDto', () => {
    it('should remove application from dto', () => {
      service.removePanosApplicationFromDto({ id: 1 } as any);
      expect((service as any).dto.panosApplicationsToRemove).toEqual([{ id: 1 }]);
    });

    it('should remove application from dto', () => {
      (service as any).dto.panosApplicationsToAdd = [{ id: 1 }];
      service.removePanosApplicationFromDto({ id: 1 } as any);
      expect((service as any).dto.panosApplicationsToAdd).toEqual([]);
    });
  });

  describe('isDtoEmpty', () => {
    it('should return true if dto is empty', () => {
      (service as any).dto = { panosApplicationsToAdd: [], panosApplicationsToRemove: [] };
      expect(service.isDtoEmpty()).toBe(true);
    });

    it('should return false if dto is not empty', () => {
      (service as any).dto = { panosApplicationsToAdd: [{ id: 1 }], panosApplicationsToRemove: [] };
      expect(service.isDtoEmpty()).toBe(false);
    });
  });

  it('should reset dto', () => {
    (service as any).dto = { panosApplicationsToAdd: [{ id: 1, appVersion: 1 }], panosApplicationsToRemove: [] };
    const gerManyAppIdSpy = jest.spyOn(mockAppIdService, 'getManyAppIdRuntime').mockReturnValue(of({} as any));
    service.resetDto();
    expect((service as any).dto).toEqual({ panosApplicationsToAdd: [], panosApplicationsToRemove: [], firewallRuleId: '' });
    expect(gerManyAppIdSpy).toHaveBeenCalledWith({ filter: ['appVersion||eq||1'], relations: ['firewallRules'], perPage: 10000 });
  });

  it('should save dto with firewall rule id', () => {
    const fwSpy = jest.spyOn(mockFirewallRuleService, 'modifyPanosApplicationsFirewallRule').mockReturnValue(of({} as any));

    (service as any).dto = { panosApplicationsToAdd: [{ id: 1 }], panosApplicationsToRemove: [] };
    service.saveDto('1').subscribe();
    expect(fwSpy).toHaveBeenCalledWith({
      panosApplicationFirewallRuleDto: { panosApplicationsToAdd: [{ id: 1 }], panosApplicationsToRemove: [], firewallRuleId: '1' },
    });
  });

  it('should add application to firewall rule', () => {
    const modifySpy = jest.spyOn(service, 'modifyApplicationData');
    const addSpy = jest.spyOn(service, 'addPanosApplicationToDto');

    service.addPanosAppToFirewallRule({ id: 1, firewallRules: [] } as any, { id: 2 } as any, '1');
    expect(modifySpy).toHaveBeenCalledWith({ id: 1, firewallRules: [{ id: 2 }] }, '1');
    expect(addSpy).toHaveBeenCalledWith({ id: 1, firewallRules: [{ id: 2 }] });
  });

  it('should remove application from firewall rule', () => {
    const modifySpy = jest.spyOn(service, 'modifyApplicationData');
    const removeSpy = jest.spyOn(service, 'removePanosApplicationFromDto');

    service.removePanosAppFromFirewallRule({ id: 1, firewallRules: [{ id: 2 }] } as any, { id: 2 } as any, '1');
    expect(modifySpy).toHaveBeenCalledWith({ id: 1, firewallRules: [] }, '1');
    expect(removeSpy).toHaveBeenCalledWith({ id: 1, firewallRules: [] });
  });
});
