import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-zos',
  templateUrl: './zos.component.html',
  styleUrls: ['./zos.component.css'],
})
export class ZosComponent implements OnInit, OnDestroy {
  zosRequest: any;
  requestModalSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService) {}

  getRequests() {}

  openRequestModal(reqType) {
    this.subscribeToRequestModal();
    this.ngx.getModal('requestModal').open();
  }

  subscribeToRequestModal() {
    this.requestModalSubscription = this.ngx
      .getModal('requestModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        this.getRequests();
        this.ngx.resetModalData('requestModal');
      });
  }

  private unsubAll() {
    [this.requestModalSubscription].forEach(sub => {
      try {
        if (sub) {
          sub.unsubscribe();
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  ngOnInit() {
    this.getRequests();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
