import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { Userpass } from '../models/userpass';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class AutomationApiService {

  constructor(private http: HttpClient, private auth: AuthServiceService) { }

  apiBase = 'http://localhost:3000';

  getJobs(query?: string) {
    if (query == null) { query = ''; }

    return this.http.get(this.apiBase + '/api/v2/jobs/' + query);
  }

  launchTemplate(jobName: string, ansibleBody) {
    return this.http.post(this.apiBase + '/api/v2/job_templates/' + jobName + '/launch/', ansibleBody);
  }

  login(userpass: Userpass) {

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: `Basic ${userpass.toBase64()}`
      })
    };

    return this.http.get(this.apiBase + '/api/1.0/adminusers/', httpOptions);
  }

  getAdminGroups() {
    return this.http.get(this.apiBase + '/api/1.0/admingroups/');
  }

  getSubnets() {
    return this.http.get(this.apiBase + '/api/1.0/subnets/');
  }

  getSubnet(id: string){
    return this.http.get(this.apiBase + `/api/1.0/subnets/${id}`);
  }

  getSubnetIps(id: string){
    return this.http.get(this.apiBase + `/api/1.0/ips/subnet_id/${id}`);
  }
}
