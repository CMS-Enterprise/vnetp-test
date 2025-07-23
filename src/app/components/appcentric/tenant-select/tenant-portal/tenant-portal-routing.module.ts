import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantPortalComponent } from './tenant-portal.component';

const outlet = 'tenant-portal';
const routes: Routes = [
  {
    path: 'edit/:id/home',
    component: TenantPortalComponent,
    children: [
      {
        outlet,
        path: 'application-profile',
        data: { breadcrumb: 'Application Profile', title: 'Tenant Portal - Application Profile' },
        loadChildren: () => import('./application-profile/application-profile.module').then(m => m.ApplicationProfileModule),
      },
      {
        outlet,
        path: 'endpoint-group',
        data: { breadcrumb: 'Endpoint Group', title: 'Tenant Portal - Endpoint Group' },
        loadChildren: () => import('./endpoint-group/endpoint-group.module').then(m => m.EndpointGroupModule),
      },
      {
        outlet,
        path: 'bridge-domain',
        data: { breadcrumb: 'Bridge Domain', title: 'Tenant Portal - Bridge Domain' },
        loadChildren: () => import('./bridge-domain/bridge-domain.module').then(m => m.BridgeDomainModule),
      },
      {
        outlet,
        path: 'contract',
        data: { breadcrumb: 'Contract', title: 'Tenant Portal - Contract' },
        loadChildren: () => import('./contract/contract.module').then(m => m.ContractModule),
      },
      {
        outlet,
        path: 'filter',
        data: { breadcrumb: 'Filter', title: 'Tenant Portal - Filter' },
        loadChildren: () => import('./filter/filter.module').then(m => m.FilterModule),
      },
      {
        outlet,
        path: 'vrf',
        data: { breadcrumb: 'VRF', title: 'Tenant Portal - VRF' },
        loadChildren: () => import('./vrf/vrf.module').then(m => m.VrfModule),
      },
      {
        outlet,
        path: 'l3-outs',
        data: { breadcrumb: 'l3 Outs', title: 'Tenant Portal - L3 Outs' },
        loadChildren: () => import('./l3-outs/l3-outs.module').then(m => m.L3OutsModule),
      },
      {
        outlet,
        path: 'route-profile',
        data: { breadcrumb: 'Route Profile', title: 'Tenant Portal - Route Profile' },
        loadChildren: () => import('./route-profile/route-profile.module').then(m => m.RouteProfileModule),
      },
      {
        outlet,
        path: 'internal-firewall',
        data: {
          breadcrumb: 'Internal Firewall',
          title: 'Internal Firewall',
        },
        loadChildren: () => import('./tenant-v2-firewall/tenant-v2-firewall.module').then(m => m.TenantV2FirewallModule),
      },
      {
        outlet,
        path: 'internal-nat',
        data: { breadcrumb: 'Internal NAT', title: 'Internal NAT' },
        loadChildren: () => import('./tenant-v2-nat/tenant-v2-nat.module').then(m => m.TenantV2NatModule),
      },

      {
        outlet,
        path: 'internal-service-objects',
        data: { breadcrumb: 'Internal Service Objects', title: 'Internal Service Objects' },
        loadChildren: () =>
          import('src/app/components/service-objects-groups/service-objects-groups.module').then(m => m.ServiceObjectsGroupsModule),
      },
      {
        outlet,
        path: 'external-firewall',
        data: {
          breadcrumb: 'External Firewall',
          title: 'External Firewall',
        },
        loadChildren: () => import('./tenant-v2-firewall/tenant-v2-firewall.module').then(m => m.TenantV2FirewallModule),
      },
      {
        outlet,
        path: 'external-nat',
        data: { breadcrumb: 'External NAT', title: 'External NAT' },
        loadChildren: () => import('./tenant-v2-nat/tenant-v2-nat.module').then(m => m.TenantV2NatModule),
      },
      {
        outlet,
        path: 'external-service-objects',
        data: { breadcrumb: 'External Service Objects', title: 'External Service Objects' },
        loadChildren: () =>
          import('src/app/components/service-objects-groups/service-objects-groups.module').then(m => m.ServiceObjectsGroupsModule),
      },
      {
        outlet,
        path: 'external-network-objects',
        data: { breadcrumb: 'External Network Objects', title: 'External Network Objects' },
        loadChildren: () =>
          import('src/app/components/network-objects-groups/network-objects-groups.module').then(m => m.NetworkObjectsGroupsModule),
      },
      {
        outlet,
        path: 'endpoint-security-group',
        data: { breadcrumb: 'Endpoint Security Group', title: 'Tenant Portal - Endpoint Security Group' },
        loadChildren: () => import('./endpoint-security-group/endpoint-security-group.module').then(m => m.EndpointSecurityGroupModule),
      },
      {
        outlet,
        path: 'endpoint-connectivity-utility',
        data: { breadcrumb: 'Endpoint Connectivity Utility', title: 'Endpoint Connectivity Utility' },
        loadChildren: () =>
          import('./endpoint-connectivity-utility/endpoint-connectivity-utility.module').then(m => m.EndpointConnectivityUtilityModule),
      },
      {
        outlet,
        path: 'workflows',
        data: { breadcrumb: 'Workflows', title: 'Workflows' },
        loadChildren: () => import('./workflow/workflow.module').then(m => m.WorkflowModule),
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TenantPortalRoutingModule {}
