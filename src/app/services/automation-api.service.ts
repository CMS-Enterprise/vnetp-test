import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';


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
    // Append Customer Identifier to Job Name
    const fullJobName = `${this.auth.currentUserValue.CustomerIdentifier}-${jobName}`;
    console.log(fullJobName);
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

  getSubnets() {
    return this.http.get(environment.apiBase + '/api/1.0/subnets/');
  }

  getSubnet(id: string){
    return this.http.get(environment.apiBase + `/api/1.0/subnets/${id}`);
  }

  getSubnetIps(id: string){
    return this.http.get(environment.apiBase + `/api/1.0/ips/subnet_id/${id}`);
  }
}
