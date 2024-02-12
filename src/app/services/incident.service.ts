import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IncidentService {
  constructor() {}

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
