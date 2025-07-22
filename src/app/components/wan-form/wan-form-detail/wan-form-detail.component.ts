import { Component, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { WanForm } from 'client';

@Component({
  selector: 'app-wan-form-detail',
  templateUrl: './wan-form-detail.component.html',
  styleUrls: ['./wan-form-detail.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class WanFormDetailComponent {
  @Input() wanForm: WanForm;
  @Output() manageSubnets = new EventEmitter<void>();
  @Output() manageRoutes = new EventEmitter<void>();
  public dcsMode: ApplicationMode;
  private _global: boolean;

  @Input()
  set global(value: boolean | undefined) {
    this._global = value ?? false;
  }

  get global(): boolean {
    return this._global;
  }

  constructor() {}
}
