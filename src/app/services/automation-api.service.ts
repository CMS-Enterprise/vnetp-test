import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { Vrf } from '../models/d42/vrf';
import { AppMessage } from '../models/app-message';
import { AppMessageType } from '../models/app-message-type';
import { MessageService } from './message.service';


@Injectable({
  providedIn: 'root'
})
export class AutomationApiService {

  constructor(private http: HttpClient, private auth: AuthService, private ms: MessageService) { }

  getJobs(query?: string) {
    if (query == null) { query = ''; }

    return this.http.get(environment.apiBase + '/api/v2/jobs/' + query);
  }

  launchTemplate(jobName: string, ansibleBody, sendJobLaunchEvent = false) {
    const fullJobName = `${this.auth.currentUserValue.CustomerIdentifier}-${jobName}`;

    if (sendJobLaunchEvent) {
      this.ms.sendMessage(new AppMessage('', AppMessageType.JobLaunch));
    }
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

  getDevices() {
    return this.http.get(environment.apiBase + '/api/1.0/devices/');
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
