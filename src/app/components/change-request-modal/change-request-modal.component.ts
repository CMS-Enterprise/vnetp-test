import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { IncidentService } from 'src/app/services/incident.service';

@Component({
  selector: 'app-change-request-modal',
  templateUrl: './change-request-modal.component.html',
  styleUrls: ['./change-request-modal.component.css'],
})
export class ChangeRequestModalComponent implements OnInit {
  public form: UntypedFormGroup;
  public changeRequest;

  constructor(private formBuilder: UntypedFormBuilder, private incidentService: IncidentService, private ngx: NgxSmartModalService) {}
  ngOnInit(): void {
    this.getCRNumber();
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public save() {
    if (this.changeRequest === null || this.changeRequest === undefined) {
      return null;
    }
    this.incidentService.addIncidentNumberLocalStorage(this.changeRequest);
    this.closeModal();
  }

  public removeCRFromLocalStorage() {
    this.incidentService.removeIncidentNumberLocalStorage();
    this.getCRNumber();
    this.closeModal();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      changeRequest: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(30)])],
    });
  }

  public closeModal(): void {
    this.ngx.close('changeRequestModal');
  }

  public getCRNumber() {
    this.changeRequest = this.incidentService.getIncidentLocalStorage();
  }
}
