import { TierContextService } from './tier-context.service';
import { V1DatacentersService } from 'client';
import { DatacenterContextService } from './datacenter-context.service';
import { Message, MessageService } from './message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Tier } from 'client';
import { BehaviorSubject, of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

describe('TierContextService', () => {
  let service: TierContextService;
  let datacenterContextServiceSpy: any;
  let datacenterServiceSpy: any;
  let messageServiceSpy: any;
  let routerSpy: any;
  let activatedRouteSpy: any;

  beforeEach(() => {
    datacenterContextServiceSpy = {
      currentDatacenter: new BehaviorSubject({ id: 'dc-1' }),
    };
    datacenterServiceSpy = {
      getOneDatacenters: jest.fn().mockImplementation(() => ({
        subscribe: jest.fn(),
      })),
    };
    messageServiceSpy = {
      sendMessage: jest.fn(),
    };
    routerSpy = {
      events: { subscribe: jest.fn() },
      navigate: jest.fn(),
    };
    activatedRouteSpy = {
      queryParamMap: { subscribe: jest.fn() },
    };

    service = new TierContextService(datacenterServiceSpy, datacenterContextServiceSpy, messageServiceSpy, routerSpy, activatedRouteSpy);
  });

  it('should lock and unlock tier', () => {
    service.lockTier();
    expect(service.tierLockValue).toBe(true);
    service.unlockTier();
    expect(service.tierLockValue).toBe(false);
  });

  it('should not switch tier if the current tier is locked', () => {
    const tierId = 'tier-2';
    service.lockTier();
    const result = service.switchTier(tierId);
    expect(result).toBe(false);
    expect(messageServiceSpy.sendMessage).toHaveBeenCalledWith(new Message(null, null, 'Current tier locked'));
  });

  it('should not switch tier if the provided tierId does not exist in the tiers list', () => {
    const tierId = 'tier-5';
    const result = service.switchTier(tierId);
    expect(result).toBe(false);
  });

  it('should not switch tier if the provided tierId is already the current tier', () => {
    const tier = { id: 'tier-1', name: 'Tier 1' } as any;
    service['_tiers'] = [tier];
    service['currentTierSubject'].next(tier);

    const result = service.switchTier(tier.id);
    expect(result).toBe(false);
    expect(messageServiceSpy.sendMessage).toHaveBeenCalledWith(new Message(null, null, 'Tier already selected'));
  });

  it('should switch tier successfully and send a message', () => {
    const tier1 = { id: 'tier-1', name: 'Tier 1' } as any;
    const tier2 = { id: 'tier-2', name: 'Tier 2' } as any;
    service['_tiers'] = [tier1, tier2];
    service['currentTierSubject'].next(tier1);

    const result = service.switchTier(tier2.id);
    expect(result).toBe(true);
    expect(messageServiceSpy.sendMessage).toHaveBeenCalledWith(new Message(tier1.id, tier2.id, 'Tier Switched'));
    expect(routerSpy.navigate).toHaveBeenCalledWith([], { queryParams: { tier: tier2.id }, queryParamsHandling: 'merge' });
  });

  it('should clear the current tier', () => {
    const tier = { id: 'tier-1', name: 'Tier 1' } as any;
    service['currentTierSubject'].next(tier);
    service.clearTier();
    expect(service.currentTierValue).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith([], { queryParams: { tier: null }, queryParamsHandling: 'merge' });
  });

  it('should update tiers when the datacenter context changes', () => {
    const datacenterId = 'datacenter-1';
    const tier1 = { id: 'tier-1', name: 'Tier 1' } as any;
    const tier2 = { id: 'tier-2', name: 'Tier 2' } as any;
    const tiers = [tier1, tier2];
    datacenterContextServiceSpy.currentDatacenter.subscribe = jest.fn(callback => {
      callback({ id: datacenterId });
    });

    datacenterServiceSpy.getOneDatacenters.mockReturnValueOnce(of({ id: datacenterId, tiers }));

    service['getTiers']();

    expect(datacenterServiceSpy.getOneDatacenters).toHaveBeenCalledWith({ id: datacenterId, join: ['tiers'] });
    expect(service.tiersValue).toEqual(tiers);
  });
});
