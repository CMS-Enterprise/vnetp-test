import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import {
  ExternalFirewall,
  ServiceGraphFirewall,
  Tenant,
  Tier,
  V2AppCentricExternalFirewallsService,
  V2AppCentricServiceGraphFirewallsService,
  V2AppCentricTenantsService,
} from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';
import { FirewallConfigResolver, FirewallConfigResolvedData } from './firewall-config.resolver';

describe('FirewallConfigResolver', () => {
  let resolver: FirewallConfigResolver;
  let mockExternalFirewallService: Partial<V2AppCentricExternalFirewallsService>;
  let mockServiceGraphFirewallService: Partial<V2AppCentricServiceGraphFirewallsService>;
  let mockTenantService: Partial<V2AppCentricTenantsService>;
  let mockTierContextService: Partial<TierContextService>;
  let mockRouter: Partial<Router>;
  let mockRoute: Partial<ActivatedRouteSnapshot>;
  let mockParentRoute: Partial<ActivatedRouteSnapshot>;

  const mockFirewallId = '12345678-1234-1234-1234-123456789abc';
  const mockTenantId = 'tenant-123';
  const mockTierId = 'tier-456';

  const mockExternalFirewall: ExternalFirewall = {
    id: mockFirewallId,
    name: 'Test External Firewall',
    tenantId: mockTenantId,
    tierId: mockTierId,
    tier: {
      id: mockTierId,
      name: 'Test Tier',
      tenantId: mockTenantId,
    } as Tier,
  } as ExternalFirewall;

  const mockServiceGraphFirewall: ServiceGraphFirewall = {
    id: mockFirewallId,
    name: 'Test Service Graph Firewall',
    tenantId: mockTenantId,
    tierId: mockTierId,
    tier: {
      id: mockTierId,
      name: 'Test Tier',
      tenantId: mockTenantId,
    } as Tier,
  } as ServiceGraphFirewall;

  const mockTiers: Tier[] = [
    {
      id: mockTierId,
      name: 'Test Tier',
      tenantId: mockTenantId,
    } as Tier,
  ];

  const mockTenant: Tenant = {
    id: mockTenantId,
    name: 'Test Tenant',
    tiers: mockTiers,
  } as Tenant;

  beforeEach(() => {
    mockExternalFirewallService = {
      getOneExternalFirewall: jest.fn(),
    };

    mockServiceGraphFirewallService = {
      getOneServiceGraphFirewall: jest.fn(),
    };

    mockTenantService = {
      getOneTenant: jest.fn(),
    };

    mockTierContextService = {
      clearTier: jest.fn(),
      unlockTier: jest.fn(),
      setTenantTiers: jest.fn(),
      lockTier: jest.fn(),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        FirewallConfigResolver,
        { provide: V2AppCentricExternalFirewallsService, useValue: mockExternalFirewallService },
        { provide: V2AppCentricServiceGraphFirewallsService, useValue: mockServiceGraphFirewallService },
        { provide: V2AppCentricTenantsService, useValue: mockTenantService },
        { provide: TierContextService, useValue: mockTierContextService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    resolver = TestBed.inject(FirewallConfigResolver);

    // Setup mock route
    mockParentRoute = {
      paramMap: {
        has: jest.fn(),
        get: jest.fn(),
      } as any,
    };

    mockRoute = {
      paramMap: {
        has: jest.fn(),
        get: jest.fn(),
      } as any,
      parent: mockParentRoute as ActivatedRouteSnapshot,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  describe('resolve', () => {
    describe('when firewallId is missing', () => {
      it('should return null firewall with external-firewall type', done => {
        (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(false);
        (mockParentRoute.paramMap?.has as jest.Mock).mockReturnValue(false);

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          next: (result: FirewallConfigResolvedData) => {
            expect(result.firewall).toBeNull();
            expect(result.firewallType).toBe('external-firewall');
            done();
          },
        });
      });
    });

    describe('when firewallId is not a valid UUID', () => {
      it('should return null firewall', done => {
        (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
        (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'firewallId') {
            return 'invalid-uuid';
          }
          if (key === 'firewallType') {
            return 'external-firewall';
          }
          return null;
        });

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          next: (result: FirewallConfigResolvedData) => {
            expect(result.firewall).toBeNull();
            expect(result.firewallType).toBe('external-firewall');
            done();
          },
        });
      });
    });

    describe('when firewallType is external-firewall', () => {
      beforeEach(() => {
        (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
        (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'firewallId') {
            return mockFirewallId;
          }
          if (key === 'firewallType') {
            return 'external-firewall';
          }
          return null;
        });
      });

      it('should call getOneExternalFirewall', done => {
        (mockExternalFirewallService.getOneExternalFirewall as jest.Mock).mockReturnValue(
          of(mockExternalFirewall),
        );
        (mockTenantService.getOneTenant as jest.Mock).mockReturnValue(of(mockTenant));

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          next: () => {
            expect(mockExternalFirewallService.getOneExternalFirewall).toHaveBeenCalledWith({
              id: mockFirewallId,
              relations: ['tier'],
            });
            done();
          },
        });
      });

      it('should return firewall data with tenant', done => {
        (mockExternalFirewallService.getOneExternalFirewall as jest.Mock).mockReturnValue(
          of(mockExternalFirewall),
        );
        (mockTenantService.getOneTenant as jest.Mock).mockReturnValue(of(mockTenant));

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          next: (result: FirewallConfigResolvedData) => {
            expect(result.firewall).toEqual(mockExternalFirewall);
            expect(result.firewallType).toBe('external-firewall');
            expect(result.tenant).toEqual(mockTenant);
            done();
          },
        });
      });
    });

    describe('when firewallType is service-graph-firewall', () => {
      beforeEach(() => {
        (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
        (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'firewallId') {
            return mockFirewallId;
          }
          if (key === 'firewallType') {
            return 'service-graph-firewall';
          }
          return null;
        });
      });

      it('should call getOneServiceGraphFirewall', done => {
        (mockServiceGraphFirewallService.getOneServiceGraphFirewall as jest.Mock).mockReturnValue(
          of(mockServiceGraphFirewall),
        );
        (mockTenantService.getOneTenant as jest.Mock).mockReturnValue(of(mockTenant));

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          next: () => {
            expect(mockServiceGraphFirewallService.getOneServiceGraphFirewall).toHaveBeenCalledWith({
              id: mockFirewallId,
              relations: ['tier'],
            });
            done();
          },
        });
      });

      it('should return firewall data with tenant', done => {
        (mockServiceGraphFirewallService.getOneServiceGraphFirewall as jest.Mock).mockReturnValue(
          of(mockServiceGraphFirewall),
        );
        (mockTenantService.getOneTenant as jest.Mock).mockReturnValue(of(mockTenant));

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          next: (result: FirewallConfigResolvedData) => {
            expect(result.firewall).toEqual(mockServiceGraphFirewall);
            expect(result.firewallType).toBe('service-graph-firewall');
            expect(result.tenant).toEqual(mockTenant);
            done();
          },
        });
      });
    });

    describe('when firewall has no tierId', () => {
      it('should return error', done => {
        (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
        (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'firewallId') {
            return mockFirewallId;
          }
          if (key === 'firewallType') {
            return 'external-firewall';
          }
          return null;
        });

        const firewallWithoutTier = { ...mockExternalFirewall, tierId: undefined };
        (mockExternalFirewallService.getOneExternalFirewall as jest.Mock).mockReturnValue(
          of(firewallWithoutTier),
        );

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          error: (error: Error) => {
            expect(error.message).toBe('Unable to load firewall configuration.');
            expect(consoleErrorSpy).toHaveBeenCalledWith('Firewall is not associated with a tier.');
            consoleErrorSpy.mockRestore();
            done();
          },
        });
      });
    });

    describe('when firewall has no tenantId', () => {
      it('should return firewall without loading tenant', done => {
        (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
        (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'firewallId') {
            return mockFirewallId;
          }
          if (key === 'firewallType') {
            return 'external-firewall';
          }
          return null;
        });

        const firewallWithoutTenant = {
          ...mockExternalFirewall,
          tenantId: undefined,
          tier: { id: mockTierId, tenantId: undefined },
        };
        (mockExternalFirewallService.getOneExternalFirewall as jest.Mock).mockReturnValue(
          of(firewallWithoutTenant),
        );

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          next: (result: FirewallConfigResolvedData) => {
            expect(result.firewall).toEqual(firewallWithoutTenant);
            expect(result.tenant).toBeUndefined();
            expect(mockTenantService.getOneTenant).not.toHaveBeenCalled();
            done();
          },
        });
      });
    });

    describe('when tenant loading fails', () => {
      it('should continue with firewall data and clear tier context', done => {
        (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
        (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'firewallId') {
            return mockFirewallId;
          }
          if (key === 'firewallType') {
            return 'external-firewall';
          }
          return null;
        });

        (mockExternalFirewallService.getOneExternalFirewall as jest.Mock).mockReturnValue(
          of(mockExternalFirewall),
        );
        (mockTenantService.getOneTenant as jest.Mock).mockReturnValue(
          throwError(() => new Error('Tenant not found')),
        );

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          next: (result: FirewallConfigResolvedData) => {
            expect(result.firewall).toEqual(mockExternalFirewall);
            expect(result.tenant).toBeUndefined();
            expect(mockTierContextService.clearTier).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
              'Failed to load tenant tiers, continuing with firewall data.',
            );
            consoleErrorSpy.mockRestore();
            done();
          },
        });
      });
    });

    describe('when firewall loading fails', () => {
      it('should return error', done => {
        (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
        (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'firewallId') {
            return mockFirewallId;
          }
          if (key === 'firewallType') {
            return 'external-firewall';
          }
          return null;
        });

        (mockExternalFirewallService.getOneExternalFirewall as jest.Mock).mockReturnValue(
          throwError(() => new Error('Firewall not found')),
        );

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          error: (error: Error) => {
            expect(error.message).toBe('Unable to load firewall configuration.');
            expect(consoleErrorSpy).toHaveBeenCalledWith('Unable to load firewall configuration.');
            consoleErrorSpy.mockRestore();
            done();
          },
        });
      });
    });

    describe('when paramMap is on parent route', () => {
      it('should check parent route for parameters', done => {
        (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(false);
        (mockParentRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
        (mockParentRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'firewallId') {
            return mockFirewallId;
          }
          if (key === 'firewallType') {
            return 'external-firewall';
          }
          return null;
        });

        (mockExternalFirewallService.getOneExternalFirewall as jest.Mock).mockReturnValue(
          of(mockExternalFirewall),
        );
        (mockTenantService.getOneTenant as jest.Mock).mockReturnValue(of(mockTenant));

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          next: (result: FirewallConfigResolvedData) => {
            expect(result.firewall).toEqual(mockExternalFirewall);
            expect(mockParentRoute.paramMap?.get).toHaveBeenCalledWith('firewallId');
            done();
          },
        });
      });
    });

    describe('when firewallId needs URL decoding', () => {
      it('should decode the firewallId', done => {
        const encodedId = encodeURIComponent(mockFirewallId);
        (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
        (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'firewallId') {
            return encodedId;
          }
          if (key === 'firewallType') {
            return 'external-firewall';
          }
          return null;
        });

        (mockExternalFirewallService.getOneExternalFirewall as jest.Mock).mockReturnValue(
          of(mockExternalFirewall),
        );
        (mockTenantService.getOneTenant as jest.Mock).mockReturnValue(of(mockTenant));

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          next: () => {
            expect(mockExternalFirewallService.getOneExternalFirewall).toHaveBeenCalledWith({
              id: mockFirewallId,
              relations: ['tier'],
            });
            done();
          },
        });
      });
    });

    describe('tier context', () => {
      beforeEach(() => {
        (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
        (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'firewallId') {
            return mockFirewallId;
          }
          if (key === 'firewallType') {
            return 'external-firewall';
          }
          return null;
        });
      });

      it('should set tier context when tenant has tiers', done => {
        (mockExternalFirewallService.getOneExternalFirewall as jest.Mock).mockReturnValue(
          of(mockExternalFirewall),
        );
        (mockTenantService.getOneTenant as jest.Mock).mockReturnValue(of(mockTenant));

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          next: () => {
            expect(mockTierContextService.unlockTier).toHaveBeenCalled();
            expect(mockTierContextService.setTenantTiers).toHaveBeenCalledWith(mockTiers, mockTierId);
            expect(mockTierContextService.lockTier).toHaveBeenCalled();
            done();
          },
        });
      });

      it('should clear tier context when tenant has no tiers', done => {
        const tenantWithoutTiers = { ...mockTenant, tiers: [] };
        (mockExternalFirewallService.getOneExternalFirewall as jest.Mock).mockReturnValue(
          of(mockExternalFirewall),
        );
        (mockTenantService.getOneTenant as jest.Mock).mockReturnValue(of(tenantWithoutTiers));

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          next: () => {
            expect(mockTierContextService.clearTier).toHaveBeenCalled();
            expect(mockTierContextService.setTenantTiers).not.toHaveBeenCalled();
            done();
          },
        });
      });
    });

    describe('when firewall is null', () => {
      it('should return null firewall', done => {
        (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
        (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'firewallId') {
            return mockFirewallId;
          }
          if (key === 'firewallType') {
            return 'external-firewall';
          }
          return null;
        });

        (mockExternalFirewallService.getOneExternalFirewall as jest.Mock).mockReturnValue(of(null));

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          next: (result: FirewallConfigResolvedData) => {
            expect(result.firewall).toBeNull();
            expect(result.firewallType).toBe('external-firewall');
            done();
          },
        });
      });
    });

    describe('when tenantId is derived from tier', () => {
      it('should use tier.tenantId when firewall.tenantId is missing', done => {
        (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
        (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
          if (key === 'firewallId') {
            return mockFirewallId;
          }
          if (key === 'firewallType') {
            return 'external-firewall';
          }
          return null;
        });

        const firewallWithTierTenant = {
          ...mockExternalFirewall,
          tenantId: undefined,
          tier: { id: mockTierId, tenantId: mockTenantId },
        };

        (mockExternalFirewallService.getOneExternalFirewall as jest.Mock).mockReturnValue(
          of(firewallWithTierTenant),
        );
        (mockTenantService.getOneTenant as jest.Mock).mockReturnValue(of(mockTenant));

        resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
          next: (result: FirewallConfigResolvedData) => {
            expect(mockTenantService.getOneTenant).toHaveBeenCalledWith({
              id: mockTenantId,
              relations: ['tiers'],
            });
            expect(result.tenant).toEqual(mockTenant);
            done();
          },
        });
      });
    });
  });

  describe('UUID validation', () => {
    it('should accept valid lowercase UUIDs', done => {
      const validUuid = '12345678-1234-1234-1234-123456789abc';
      (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
      (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'firewallId') {
          return validUuid;
        }
        if (key === 'firewallType') {
          return 'external-firewall';
        }
        return null;
      });

      (mockExternalFirewallService.getOneExternalFirewall as jest.Mock).mockReturnValue(
        of(mockExternalFirewall),
      );
      (mockTenantService.getOneTenant as jest.Mock).mockReturnValue(of(mockTenant));

      resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
        next: () => {
          expect(mockExternalFirewallService.getOneExternalFirewall).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should accept valid uppercase UUIDs', done => {
      const validUuid = '12345678-1234-1234-1234-123456789ABC';
      (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
      (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'firewallId') {
          return validUuid;
        }
        if (key === 'firewallType') {
          return 'external-firewall';
        }
        return null;
      });

      (mockExternalFirewallService.getOneExternalFirewall as jest.Mock).mockReturnValue(
        of(mockExternalFirewall),
      );
      (mockTenantService.getOneTenant as jest.Mock).mockReturnValue(of(mockTenant));

      resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
        next: () => {
          expect(mockExternalFirewallService.getOneExternalFirewall).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should reject UUIDs with wrong format', done => {
      const invalidUuid = '12345678-1234-1234-1234';
      (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
      (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'firewallId') {
          return invalidUuid;
        }
        if (key === 'firewallType') {
          return 'external-firewall';
        }
        return null;
      });

      resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
        next: (result: FirewallConfigResolvedData) => {
          expect(result.firewall).toBeNull();
          expect(mockExternalFirewallService.getOneExternalFirewall).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should reject non-UUID strings', done => {
      const invalidUuid = 'not-a-uuid';
      (mockRoute.paramMap?.has as jest.Mock).mockReturnValue(true);
      (mockRoute.paramMap?.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'firewallId') {
          return invalidUuid;
        }
        if (key === 'firewallType') {
          return 'external-firewall';
        }
        return null;
      });

      resolver.resolve(mockRoute as ActivatedRouteSnapshot).subscribe({
        next: (result: FirewallConfigResolvedData) => {
          expect(result.firewall).toBeNull();
          expect(mockExternalFirewallService.getOneExternalFirewall).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });
});

