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
        path: 'external-firewalls',
        data: { breadcrumb: 'External Firewalls', title: 'Tenant Portal - External Firewalls' },
        loadChildren: () => import('./external-firewalls/external-firewalls.module').then(m => m.ExternalFirewallsModule),
      },
      {
        outlet,
        path: 'service-graphs',
        data: { breadcrumb: 'Service Graphs', title: 'Tenant Portal - Service Graphs' },
        loadChildren: () => import('./service-graphs/service-graphs.module').then(m => m.ServiceGraphsModule),
      },
      {
        outlet,
        path: 'firewall-config',
        data: { breadcrumb: 'Firewall Configuration', title: 'Tenant Portal - Firewall Configuration' },
        loadChildren: () => import('./firewall-config/firewall-config.module').then(m => m.FirewallConfigModule),
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
      {
        outlet,
        path: 'tenant-graph',
        data: { breadcrumb: 'Graph', title: 'Tenant Portal - Graph' },
        loadChildren: () => import('./tenant-graph/tenant-graph.module').then(m => m.TenantGraphModule),
      },
    ],
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TenantPortalRoutingModule {}
