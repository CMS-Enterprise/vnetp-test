import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TenantStateService {
  private tenant: string | null = null;

  constructor() {}

  setTenant(tenant: string): void {
    this.tenant = tenant;
  }

  getTenant(): string | null {
    return this.tenant;
  }

  clearTenant(): void {
    this.tenant = null;
  }

  isTenantSet(): boolean {
    return this.tenant !== null;
  }
}
