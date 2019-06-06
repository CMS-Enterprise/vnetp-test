import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { Vrf } from '../models/d42/vrf';


@Injectable({
  providedIn: 'root'
})
export class AutomationApiService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  getJobs(query?: string) {
    if (query == null) { query = ''; }

    return this.http.get(environment.apiBase + '/api/v2/jobs/' + query);
  }

  launchTemplate(jobName: string, ansibleBody) {
    const fullJobName = `${this.auth.currentUserValue.CustomerIdentifier}-${jobName}`;
    return this.http.post(environment.apiBase + '/api/v2/job_templates/' + fullJobName + '/launch/', ansibleBody);
  }

  getAdminGroups() {
    return this.http.get(environment.apiBase + '/api/1.0/admingroups/');
  }

  doqlQuery(query: string) {
    return this.http.get(environment.apiBase + '/services/data/v1.0/query/?query=' + query + '&output_type=json');
  }

  getIps() {
    return this.http.get(environment.apiBase + '/api/1.0/ips/');
  }

  getIpNats() {
    return this.http.get(environment.apiBase + '/api/1.0/ipnat/');
  }

  getDevicesbyID(id: string) {
    return this.http.get(environment.apiBase + `/api/1.0/devices/${id}/`);
  }
  getDevices(){
    return this.http.get(environment.apiBase + `/api/1.0/devices/`);
  }

  getCDoms() {
    return this.http.get(environment.apiBase + `/api/1.0/devices/?custom_fields_and=DeviceType:solaris_cdom`);
  }

  getLDoms() {
    return this.http.get(environment.apiBase + `/api/1.0/devices/?custom_fields_and=DeviceType:solaris_ldom`);
  }

  getLDomsForCDom(name: string){
    return this.http.get(environment.apiBase + `/api/1.0/devices/?custom_fields_and=DeviceType:solaris_ldom&virtual_host_name=${name}`);
  }

  getVrfs() {
    return this.http.get<Vrf[]>(environment.apiBase + '/api/1.0/vrf_group/');
  }

  getSubnets(vrfId?: number) {
    let uri = '/api/1.0/subnets';

    if (vrfId) {
      uri += `?vrf_group_id=${vrfId}`;
    }

    return this.http.get(environment.apiBase + uri);
  }

  getSubnet(id: string) {
    return this.http.get(environment.apiBase + `/api/1.0/subnets/${id}`);
  }

  getSubnetIps(id: number) {
    return this.http.get(environment.apiBase + `/api/1.0/ips/subnet_id/${id}`);
  }
}
