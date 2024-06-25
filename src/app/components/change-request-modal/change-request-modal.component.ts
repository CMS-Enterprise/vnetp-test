import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { IncidentService } from 'src/app/services/incident.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
// import { ChangeRequestValidator } from 'src/app/validators/change-request-validator';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-change-request-modal',
  templateUrl: './change-request-modal.component.html',
  styleUrls: ['./change-request-modal.component.css'],
})
export class ChangeRequestModalComponent implements OnInit {
  public form: UntypedFormGroup;
  // public changeRequest;
  changeRequestNumber: string;
  private changeRequestSubscription: Subscription;
  submitted: boolean;

  constructor(private formBuilder: UntypedFormBuilder, private incidentService: IncidentService, private ngx: NgxSmartModalService) {}
  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public save(): boolean {
    this.submitted = true;
    if (this.form.invalid) {
      return false;
    }
    this.incidentService.currentIncidentValue = this.f.changeRequest.value;

    this.closeModal();
  }

  public removeCRFromLocalStorage(): void {
    this.incidentService.currentIncidentValue = '';
    this.incidentService.removeIncidentNumberLocalStorage();
    this.unsub();
    this.closeModal();
  }

  public getData(): void {
    this.changeRequestSubscription = this.incidentService.currentIncident.subscribe(inc => {
      this.f.changeRequest.setValue(inc);
      this.changeRequestNumber = inc;
    });
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      changeRequest: ['', NameValidator()],
    });
  }

  public closeModal(): void {
    this.unsub();
    this.form.reset();
    this.ngx.close('changeRequestModal');
    this.submitted = false;
  }

  removeChangeRequest(event): void {
    const modalDto = new YesNoModalDto('Remove Change Request', `Are you sure you would like to remove Change Request : "${event}"`);
    const onConfirm = () => {
      this.removeCRFromLocalStorage();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public unsub(): void {
    SubscriptionUtil.unsubscribe([this.changeRequestSubscription]);
  }
}
