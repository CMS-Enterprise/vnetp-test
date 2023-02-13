import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { EndpointGroup, V2AppCentricEndpointGroupsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { EndpointGroupModalDto } from 'src/app/models/appcentric/endpoint-group-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableContextService } from 'src/app/services/table-context.service';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-ap-endpoint-group-modal',
  templateUrl: './ap-endpoint-group-modal.component.html',
  // styleUrls: ['./ap-endpoint-group-modal.component.css'],
})
export class ApEndpointGroupModalComponent {
  @Input() public applicationProfileId: string;
  public form: FormGroup;
  public submitted: boolean;
  public tenantId: string;
  public perPage = 5;
  public isLoading = false;
  public modalMode: ModalMode;
  public endpointGroupId: string;

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private endpointGroupService: V2AppCentricEndpointGroupsService,
    private router: Router,
    private tableContextService: TableContextService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const match = event.url.match(/tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/);
        if (match) {
          const uuid = match[0].split('/')[2];
          this.tenantId = uuid;
        }
      }
    });
  }

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('apEndpointGroupModal');
    this.reset();
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('apEndpointGroupModal');
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

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('apEndpointGroupModal') as EndpointGroupModalDto);

    this.modalMode = dto.modalMode;
    if (this.modalMode === ModalMode.Edit) {
      this.endpointGroupId = dto.endpointGroup.id;
    } else {
      this.form.controls.name.enable();
    }

    const endpointGroup = dto.endpointGroup;
    if (endpointGroup !== undefined) {
      this.form.controls.name.setValue(endpointGroup.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(endpointGroup.description);
      this.form.controls.alias.setValue(endpointGroup.alias);
      this.form.controls.intraEpgIsolation.setValue(endpointGroup.intraEpgIsolation);
    }

    this.ngx.resetModalData('apEndpointGroupModal');
  }

  private createEndpointGroup(endpointGroup: EndpointGroup): void {
    this.endpointGroupService.createEndpointGroup({ endpointGroup }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editEndpointGroup(endpointGroup: EndpointGroup): void {
    endpointGroup.name = null;
    endpointGroup.applicationProfileId = null;
    endpointGroup.tenantId = null;
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

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description, alias, intraEpgIsolation } = this.form.value;
    const applicationProfileId = this.applicationProfileId;
    const tenantId = this.tenantId;
    const endpointGroup = {
      name,
      description,
      alias,
      tenantId,
      applicationProfileId,
    } as EndpointGroup;

    endpointGroup.intraEpgIsolation = intraEpgIsolation === 'true';

    if (this.modalMode === ModalMode.Create) {
      this.createEndpointGroup(endpointGroup);
    } else {
      this.editEndpointGroup(endpointGroup);
    }
  }
}
