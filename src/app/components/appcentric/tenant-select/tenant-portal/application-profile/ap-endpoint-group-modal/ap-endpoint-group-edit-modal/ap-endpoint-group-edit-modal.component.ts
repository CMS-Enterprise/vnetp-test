import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EndpointGroup, V2AppCentricEndpointGroupsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { EndpointGroupModalDto } from 'src/app/models/appcentric/endpoint-group-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-ap-endpoint-group-edit-modal',
  templateUrl: './ap-endpoint-group-edit-modal.component.html',
  styleUrls: ['./ap-endpoint-group-edit-modal.component.css'],
})
export class ApEndpointGroupEditModalComponent implements OnInit {
  public endpointGroupId: string;
  public form: FormGroup;
  public submitted = false;

  constructor(
    private endpointGroupService: V2AppCentricEndpointGroupsService,
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('apEndpointGroupEditModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('apEndpointGroupEditModal') as EndpointGroupModalDto);

    this.endpointGroupId = dto.endpointGroup.id;

    const endpointGroup = dto.endpointGroup;

    if (endpointGroup !== undefined) {
      this.form.controls.name.setValue(endpointGroup.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(endpointGroup.description);
      this.form.controls.alias.setValue(endpointGroup.alias);
      this.form.controls.intraEpgIsolation.setValue(endpointGroup.intraEpgIsolation);
    }

    this.ngx.resetModalData('apEndpointGroupEditModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('apEndpointGroupEditModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      intraEpgIsolation: [null],
    });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description, alias, intraEpgIsolation } = this.form.value;
    const endpointGroup = {
      name,
      description,
      alias,
    } as EndpointGroup;

    endpointGroup.intraEpgIsolation = intraEpgIsolation === 'true';

    this.editEndpointGroup(endpointGroup);
  }

  private editEndpointGroup(endpointGroup: EndpointGroup): void {
    endpointGroup.name = null;
    this.endpointGroupService
      .updateEndpointGroup({
        uuid: this.endpointGroupId,
        endpointGroup,
      })
      .subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
  }
}
