import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { IncidentService } from 'src/app/services/incident.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-change-request-modal',
  templateUrl: './change-request-modal.component.html',
  styleUrls: ['./change-request-modal.component.css'],
})
export class ChangeRequestModalComponent implements OnInit {
  public form: UntypedFormGroup;
  public changeRequest;
  private changeRequestSubscription: Subscription;

  constructor(private formBuilder: UntypedFormBuilder, private incidentService: IncidentService, private ngx: NgxSmartModalService) {}
  ngOnInit(): void {
    this.changeRequestSubscription = this.incidentService.currentIncident.subscribe(inc => {
      this.changeRequest = inc;
    });
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public save() {
    if (this.changeRequest === null || this.changeRequest === undefined) {
      return null;
    }
    console.log('this.cr', this.changeRequest);
    this.incidentService.currentIncidentValue = this.changeRequest;

    this.closeModal();
  }

  public removeCRFromLocalStorage() {
    this.incidentService.currentIncidentValue = '';
    this.changeRequest = null;
    this.incidentService.removeIncidentNumberLocalStorage();
    this.unsub();
    this.closeModal();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      changeRequest: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(30)])],
    });
  }

  public closeModal(): void {
    this.unsub();
    this.ngx.close('changeRequestModal');
  }

  public unsub() {
    SubscriptionUtil.unsubscribe([this.changeRequestSubscription]);
  }
}
