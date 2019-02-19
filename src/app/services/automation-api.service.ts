import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VirtualMachine } from '../models/virtual-machine';

@Injectable({
  providedIn: 'root'
})
export class AutomationApiService {

  constructor(private http: HttpClient) { }

  apiBase : string = "https://localhost:44350"

  getVirtualMachines(){
    return this.get("/api/virtualmachines");
  }

  getVirtualMachine(id){
    return this.get("/api/virtualmachines/" + id);
  }

  createVirtualMachine(virtualMachine : VirtualMachine){
    return this.post("/api/virtualmachines/", virtualMachine)
  }

  getProjects(){
    return this.get("/api/projects");
  }

  getProject(id){
    return this.get("/api/projects" + id);
  }

  getTemplates(){
    return this.get("/api/templates");
  }

  getNetworks(){
    return this.get("/api/networks");
  }

  getStorage(){
    return this.get("/api/storagepools");
  }

  private get(url : string){
    return this.http.get(this.apiBase + url);
  }

  private post(url : string, body){
    return this.http.post(this.apiBase + url, body);
  }

  private put(url : string, body){
    return this.http.put(this.apiBase + url, body);
  }

  private delete(url: string){
    return this.http.delete(this.apiBase + url);
  }
}
