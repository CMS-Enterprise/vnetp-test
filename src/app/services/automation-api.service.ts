import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { Vrf } from '../models/d42/vrf';
import { AppMessage } from '../models/app-message';
import { AppMessageType } from '../models/app-message-type';
import { MessageService } from './message.service';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AutomationApiService {
  constructor(private http: HttpClient, private auth: AuthService, private ms: MessageService) {}

  launchTemplate(jobName: string, ansibleBody, sendJobLaunchMessage = false) {
    const fullJobName = `${this.auth.currentUserValue.CustomerIdentifier}-${jobName}`;

    return this.http.post<any>(environment.apiBase + '/api/v2/job_templates/' + fullJobName + '/launch/', ansibleBody).pipe(
      map(response => {
        if (sendJobLaunchMessage) {
          this.ms.sendMessage(new AppMessage(`Job ${response.job} Launched.`, response, AppMessageType.JobLaunchSuccess));
        }
        return response;
      }),
      catchError(error => {
        this.ms.sendMessage(new AppMessage(`Error: "${error.statusText}".`, AppMessageType.JobLaunchFail));
        return throwError(error);
      }),
    );
  }

  getVrf(id: any) {
    return (
      this.http
        .get<Vrf[]>(environment.apiBase + '/api/1.0/vrf_group/')
        // Getting a single VRF doesn't return custom properties.
        .pipe(
          map(response => {
            // Extract a single VRF from the full response.
            return response.find(v => v.id === Number(id));
          }),
        )
    );
  }
}
