import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ExternalRoute, ExternalVrfConnection, InternalRoute } from 'client';

@Component({
  selector: 'app-external-vrf-route-detail',
  templateUrl: './external-vrf-route-detail.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class ExternalVrfRouteDetailComponent {
  @Input() externalVrfConnection: ExternalVrfConnection;

  private _global = false;

  @Input()
  set global(value: boolean | undefined) {
    this._global = value ?? false;
  }

  get global(): boolean {
    return this._global;
  }

  @Output() manageSubnets = new EventEmitter<void>();
  @Output() manageRoutes = new EventEmitter<void>();
}


