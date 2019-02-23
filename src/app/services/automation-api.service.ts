import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VirtualMachine } from '../models/virtual-machine';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutomationApiService {

  constructor(private http: HttpClient) { }

  apiBase = 'https://localhost:44350';

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

  getNetwork(id: string) {
    return this.get('/api/networks/' + id);
  }

  getVirtualMachines(): Observable<Array<VirtualMachine>>{
    return this.http.get<Array<VirtualMachine>>(this.apiBase + '/api/virtualmachines');
  }

  getVirtualMachine(id: string): Observable<VirtualMachine> {
    return this.http.get<VirtualMachine>(this.apiBase + '/api/virtualmachines/' + id);
  }

  createVirtualMachine(virtualMachine: VirtualMachine) {
    return this.http.post(this.apiBase + '/api/virtualmachines', virtualMachine);
  }

  private get(url: string) {
    return this.http.get(this.apiBase + url);
  }

  private post(url: string, body) {
    return this.http.post(this.apiBase + url, body);
  }
}
