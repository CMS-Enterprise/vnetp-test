import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { V1ActifioApplicationGroupsService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-application-group-modal',
  templateUrl: './application-group-modal.component.html',
})
export class ApplicationGroupModalComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public modalTitle: string;
  public submitted = false;

  private applicationGroupId: string;

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private rdcApplicationGroupService: V1ActifioApplicationGroupsService,
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.reset();
  }

  public loadApplicationGroup(): void {
    const applicationGroup = this.ngx.getModalData('applicationGroupModal');
    this.applicationGroupId = applicationGroup.id;

    const isNewApplicationGroup = !this.applicationGroupId;
    this.modalTitle = isNewApplicationGroup ? 'Create Application Group' : 'Edit Application Group';

    this.loadApplicationGroupById(this.applicationGroupId);
  }

  public onClose(): void {
    this.ngx.getModal('applicationGroupModal').close();
    this.ngx.resetModalData('applicationGroupModal');
    this.reset();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const isNewApplicationGroup = !this.applicationGroupId;
    const { name } = this.form.value;

    // TODO: Add types on back-end
    const dto: any = {
      name,
    };

    if (isNewApplicationGroup) {
      this.createApplicationGroup(dto);
    } else {
      this.updateApplicationGroup(this.applicationGroupId, dto);
    }
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
    });
  }

  private reset(): void {
    this.applicationGroupId = null;
    this.submitted = false;
    this.form.reset();
    this.form.enable();
  }

  // TODO: Add types on back-end
  private createApplicationGroup(dto: any): void {
    this.rdcApplicationGroupService.v1ActifioApplicationGroupsPost().subscribe(() => this.onClose());
  }

  private loadApplicationGroupById(applicationGroupId: string): void {
    if (!applicationGroupId) {
      return;
    }
    this.rdcApplicationGroupService.v1ActifioApplicationGroupsIdGet({ id: applicationGroupId }).subscribe(applicationGroup => {
      const { name } = applicationGroup;

      this.form.controls.name.setValue(name);
      this.form.controls.name.disable();
    });
  }

  // TODO: Add types on back-end, implement PUT on back-end
  private updateApplicationGroup(applicationGroupId: string, dto: any): void {}
}
