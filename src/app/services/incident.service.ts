import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IncidentService {
  private currentIncidentSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public currentIncident: Observable<string> = this.currentIncidentSubject.asObservable();
  constructor() {
    const incidentNumber = this.getIncidentLocalStorage();
    if (incidentNumber) {
      this.currentIncidentSubject.next(incidentNumber);
    }
  }

  public get currentIncidentValue() {
    return this.currentIncidentSubject.value;
  }

  public set currentIncidentValue(incident) {
    this.currentIncidentSubject.next(incident);
    this.addIncidentNumberLocalStorage(incident);
  }

  addIncidentNumberLocalStorage(incident) {
    localStorage.setItem('incident', incident);
  }

  removeIncidentNumberLocalStorage() {
    localStorage.removeItem('incident');
  }

  getIncidentLocalStorage() {
    return localStorage.getItem('incident');
  }
}
