import { Injectable } from '@angular/core';
import { PanosApplication, V1RuntimeDataAppIdRuntimeService } from '../../../../client';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppIdRuntimeService {
  private panosApplicationsSubject: BehaviorSubject<PanosApplication[]> = new BehaviorSubject<PanosApplication[]>([]);
  public panosApplications$: Observable<PanosApplication[]> = this.panosApplicationsSubject.asObservable();

  constructor(private appIdService: V1RuntimeDataAppIdRuntimeService) {}

  loadPanosApplications(): void {
    this.appIdService.getManyAppIdRuntime({}).subscribe(
      data => {
        this.panosApplicationsSubject.next(data);
      },
      error => {
        console.error('Failed to load Panos Applications', error);
      },
    );
  }

  getPanosApplications(): Observable<PanosApplication[]> {
    return this.panosApplications$;
  }
}
