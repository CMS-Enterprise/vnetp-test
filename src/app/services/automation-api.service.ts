import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { Vrf } from '../models/d42/vrf';
import { AppMessage } from '../models/app-message';
import { AppMessageType } from '../models/app-message-type';
import { MessageService } from './message.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SolarisImage } from 'src/app/models/solaris/solaris-image';

@Injectable({
  providedIn: 'root'
})
export class AutomationApiService {

  constructor(private http: HttpClient, private auth: AuthService, private ms: MessageService) { }

  getJobs(query?: string) {
    if (query == null) { query = ''; }

    return this.http.get(environment.apiBase + '/api/v2/jobs/' + query);
  }

  getJob(id: number) {
    return this.http.get(environment.apiBase + '/api/v2/jobs/' + `${id}/`);
  }

  launchTemplate(jobName: string, ansibleBody, sendJobLaunchMessage = false) {
    const fullJobName = `${this.auth.currentUserValue.CustomerIdentifier}-${jobName}`;

    return this.http.post<any>(environment.apiBase + '/api/v2/job_templates/' + fullJobName + '/launch/', ansibleBody)
    .pipe(map( response => {
      if (sendJobLaunchMessage) {
        this.ms.sendMessage(new AppMessage(`Job ${response.job} Launched.`, response, AppMessageType.JobLaunchSuccess));
      }
      return response;
     }),
     catchError( error => {
       this.ms.sendMessage(new AppMessage(`Error: "${error.statusText}".`, AppMessageType.JobLaunchFail));
       // FIXME: Depreceated
       return Observable.throw(error);
     }));
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
  getDevicesbyName(name: string){
    return this.http.get(environment.apiBase + `/api/1.0/devices/?name=${name}`);
  }
  getCDoms() {
    return this.http.get(environment.apiBase + `/api/1.0/devices/?custom_fields_and=DeviceType:solaris_cdom`);
  }

  getLDoms() {
    return this.http.get(environment.apiBase + `/api/1.0/devices/?custom_fields_and=DeviceType:solaris_ldom`);
  }
  getLDomByName(name: string) {
    return this.http.get(environment.apiBase + `/api/1.0/devices/?custom_fields_and=DeviceType:solaris_ldom&virtual_host_name=${name}`);
  }
  getCDomByName(name: string) {
    return this.http.get(environment.apiBase + `/api/1.0/devices/?custom_fields_and=DeviceType:solaris_cdom&virtual_host_name=${name}`);
  }

  getLDomsForCDom(name: string){
    return this.http.get(environment.apiBase + `/api/1.0/devices/?custom_fields_and=DeviceType:solaris_ldom&virtual_host_name=${name}`);
  }
  getCDomByID(id: any){
    return this.http.get(environment.apiBase + `/api/1.0/devices/?custom_fields_and=DeviceType:solaris_cdom&device_id=${id}`);
  }
  getSolarisImages(name: string){
    return this.http.get(environment.apiBase + `/api/1.0/parts/?device=${name}`);
  }
  getSolarisImageDetail(id: any){
    return this.http.get<SolarisImage[]>(environment.apiBase + `/api/1.0/parts/?device_id=${id}`);
  }

  getVrfs() {
    return this.http.get<Vrf[]>(environment.apiBase + '/api/1.0/vrf_group/');
  }

  getVrf(id: any) {
       return this.http.get<Vrf[]>(environment.apiBase + '/api/1.0/vrf_group/')
        // Getting a single VRF doesn't return custom properties.
       .pipe(map(response => {
            // Extract a single VRF from the full response.
            return response.find(v => v.id === Number(id));
        }));
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

  getSystemStatus() {
    return this.http.get(environment.apiBase + '/api/status');
  }
}
