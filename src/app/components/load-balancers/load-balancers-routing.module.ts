import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoadBalancersComponent } from './load-balancers.component';

const outlet = 'load-balancer';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: LoadBalancersComponent,
    children: [
      {
        outlet,
        path: '',
        redirectTo: 'virtual-servers',
        pathMatch: 'full',
      },
      {
        outlet,
        path: 'health-monitors',
        data: { breadcrumb: 'Health Monitors', title: 'vNETP - Load Balancers - Health Monitors' },
        loadChildren: () => import('./health-monitors/health-monitor.module').then(m => m.HealthMonitorModule),
      },
      {
        outlet,
        path: 'irules',
        data: { breadcrumb: 'iRules', title: 'vNETP - Load Balancers - iRules' },
        loadChildren: () => import('./irules/irule.module').then(m => m.IRuleModule),
      },
      {
        outlet,
        path: 'nodes',
        data: { breadcrumb: 'Nodes', title: 'vNETP - Load Balancers - Nodes' },
        loadChildren: () => import('./nodes/node.module').then(m => m.NodeModule),
      },
      {
        outlet,
        path: 'policies',
        data: { breadcrumb: 'Policies', title: 'vNETP - Load Balancers - Policies' },
        loadChildren: () => import('./policies/policy.module').then(m => m.PolicyModule),
      },
      {
        outlet,
        path: 'pools',
        data: { breadcrumb: 'Pools', title: 'vNETP - Load Balancers - Pools' },
        loadChildren: () => import('./pools/pool.module').then(m => m.PoolModule),
      },
      {
        outlet,
        path: 'profiles',
        data: { breadcrumb: 'Profiles', title: 'vNETP - Load Balancers - Profiles' },
        loadChildren: () => import('./profiles/profile.module').then(m => m.ProfileModule),
      },
      {
        outlet,
        path: 'routes',
        data: { breadcrumb: 'Routes', title: 'vNETP - Load Balancers - Routes' },
        loadChildren: () => import('./routes/route.module').then(m => m.RouteModule),
      },
      {
        outlet,
        path: 'self-ips',
        data: { breadcrumb: 'Self IPs', title: 'vNETP - Load Balancers - Self IPs' },
        loadChildren: () => import('./self-ips/self-ip.module').then(m => m.SelfIpModule),
      },
      {
        outlet,
        path: 'virtual-servers',
        data: { breadcrumb: 'Virtual Servers', title: 'vNETP - Load Balancers - Virtual Servers' },
        loadChildren: () => import('./virtual-servers/virtual-server.module').then(m => m.VirtualServerModule),
      },
      {
        outlet,
        path: 'vlans',
        data: { breadcrumb: 'VLANs', title: 'vNETP - Load Balancers - VLANs' },
        loadChildren: () => import('./vlans/vlan.module').then(m => m.VlanModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoadBalancersRoutingModule {}
