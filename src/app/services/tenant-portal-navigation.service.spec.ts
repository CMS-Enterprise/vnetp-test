import { TenantPortalNavigationService } from './tenant-portal-navigation.service';

describe('TenantPortalNavigationService', () => {
  let routerMock: any;
  let service: TenantPortalNavigationService;

  beforeEach(() => {
    routerMock = { navigate: jest.fn() };
    service = new TenantPortalNavigationService(routerMock as any);
  });

  it('navigates to firewall-config without serviceGraphId', () => {
    const activatedRoute: any = {
      snapshot: { queryParams: { tenant: 't1', foo: 'bar' } },
      parent: { parent: {} },
    };

    service.navigateToFirewallConfig({ type: 'external-firewall', firewallId: 'fid', firewallName: 'fname' }, activatedRoute);

    expect(routerMock.navigate).toHaveBeenCalledWith(
      [{ outlets: { 'tenant-portal': ['firewall-config', 'external-firewall', 'fid', 'rules'] } }],
      {
        queryParamsHandling: 'merge',
        queryParams: {},
        relativeTo: activatedRoute.parent.parent,
      },
    );
  });

  it('navigates to firewall-config with serviceGraphId', () => {
    const activatedRoute: any = {
      snapshot: { queryParams: { tenant: 't2' } },
      parent: { parent: {} },
    };

    service.navigateToFirewallConfig(
      {
        type: 'service-graph-firewall',
        firewallId: 'fid2',
        firewallName: 'fname2',
        serviceGraphId: 'sg1',
      },
      activatedRoute,
    );

    expect(routerMock.navigate).toHaveBeenCalledWith(
      [{ outlets: { 'tenant-portal': ['firewall-config', 'service-graph-firewall', 'fid2', 'rules'] } }],
      {
        queryParamsHandling: 'merge',
        queryParams: {
          serviceGraphId: 'sg1',
        },
        relativeTo: activatedRoute.parent.parent,
      },
    );
  });
});
