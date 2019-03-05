import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VirtualMachine } from '../models/virtual-machine';
import { Observable } from 'rxjs';
import { NetworkSecurityProfile } from '../models/network-security-profile';
import { Network } from '../models/network';
import { LoadBalancer } from '../models/load-balancer';

@Injectable({
  providedIn: 'root'
})
export class AutomationApiService {

  constructor(private http: HttpClient) { }

  apiBase = 'https://localhost:44350';

  ansibleBase = 'https://10.255.1.68';

  device42Base = 'https://10.255.1.252';

  getProjects() {
    return this.get('/api/projects');
  }

  getProject(id: string ) {
    return this.get('/api/projects/' + id);
  }

  getTemplates() {
    return this.get('/api/templates');
  }

  getNetworks() {
    return this.get('/api/networks');
  }

  getNetwork(id: string): Observable<Network> {
    return this.http.get<Network>(this.apiBase + '/api/networks/' + id);
  }

  getNetworkSecurityProfiles(): Observable<Array<NetworkSecurityProfile>> {
    return this.http.get<Array<NetworkSecurityProfile>>(this.apiBase + '/api/networksecurityprofiles/');
  }

  getNetworkSecurityProfile(id: string): Observable<NetworkSecurityProfile> {
    return this.http.get<NetworkSecurityProfile>(this.apiBase + '/api/networksecurityprofiles/' + id);
  }

  getLoadBalancer(id: string): Observable<LoadBalancer> {
    return this.http.get<LoadBalancer>(this.apiBase + '/api/loadbalancers/' + id);
  }

  getLoadBalancers(): Observable<Array<LoadBalancer>> {
    return this.http.get<Array<LoadBalancer>>(this.apiBase + '/api/loadbalancers');
  }

  getVirtualMachines(): Observable<Array<VirtualMachine>> {
    return this.http.get<Array<VirtualMachine>>(this.apiBase + '/api/virtualmachines');
  }

  getVirtualMachine(id: string): Observable<VirtualMachine> {
    return this.http.get<VirtualMachine>(this.apiBase + '/api/virtualmachines/' + id);
  }

  createVirtualMachine(virtualMachine: VirtualMachine) {
    return this.http.post(this.apiBase + '/api/virtualmachines', virtualMachine);
  }

  updateNetworkSecurityProfile(id: string, networkSecurityProfile: NetworkSecurityProfile) {
    return this.http.put(this.apiBase + '/api/networksecurityprofiles/' + id, networkSecurityProfile);
  }

  getJobs(query?: string) {
    if (query == null) { query = ''; }

    return this.http.get(this.ansibleBase + '/api/v2/jobs/' + query);
  }

  launchTemplate(jobName: string, ansibleBody) {
    return this.http.post(this.ansibleBase + '/api/v2/job_templates/' + jobName + '/launch/', ansibleBody);
  }

  getSubnets() {
    return this.http.get(this.device42Base + '/api/1.0/subnets/');
  }

  getSubnet(id: string){
    return this.http.get(this.device42Base + `/api/1.0/subnets/${id}`);
  }

  private get(url: string) {
    return this.http.get(this.apiBase + url);
  }

  private post(url: string, body) {
    return this.http.post(this.apiBase + url, body);
  }
}
