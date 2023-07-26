import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { ServiceObjectGroupModalHelpText } from 'src/app/helptext/help-text-networking';
import { ServiceObject, ServiceObjectGroup, V1NetworkSecurityServiceObjectGroupsService, V1TiersService } from 'client';
import { ServiceObjectGroupModalDto } from 'src/app/models/service-objects/service-object-group-modal-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-service-object-group-modal',
  templateUrl: './service-object-group-modal.component.html',
})
export class ServiceObjectGroupModalComponent implements OnInit {
  form: UntypedFormGroup;
  submitted: boolean;
  serviceObjects: Array<ServiceObject>;
  TierId: string;
  ModalMode: ModalMode;
  tierServiceObjects: Array<ServiceObject>;
  ServiceObjectGroupId: string;
  selectedServiceObject: ServiceObject;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: UntypedFormBuilder,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
    private tierService: V1TiersService,
    public helpText: ServiceObjectGroupModalHelpText,
  ) {
    this.serviceObjects = new Array<ServiceObject>();
  }

  save() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const modalServiceObjectGroup = {} as ServiceObjectGroup;

    modalServiceObjectGroup.name = this.form.value.name;
    modalServiceObjectGroup.description = this.form.value.description;

    if (this.ModalMode === ModalMode.Create) {
      modalServiceObjectGroup.tierId = this.TierId;
      modalServiceObjectGroup.type = this.form.value.type;
      this.serviceObjectGroupService
        .createOneServiceObjectGroup({
          serviceObjectGroup: modalServiceObjectGroup,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    } else {
      modalServiceObjectGroup.type = null;
      this.serviceObjectGroupService
        .updateOneServiceObjectGroup({
          id: this.ServiceObjectGroupId,
          serviceObjectGroup: modalServiceObjectGroup,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    }
  }

  private closeModal() {
    this.ngx.close('serviceObjectGroupModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('serviceObjectGroupModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  addServiceObject() {
    this.serviceObjectGroupService
      .addServiceObjectToGroupServiceObjectGroupServiceObject({
        serviceObjectGroupId: this.ServiceObjectGroupId,
        serviceObjectId: this.selectedServiceObject.id,
      })
      .subscribe(() => {
        this.selectedServiceObject = null;
        this.getGroupServiceObjects();
        this.getTierServiceObjects();
      });
  }

  public removeServiceObject(serviceObject: ServiceObject): void {
    const modalDto = new YesNoModalDto('Remove Service Object from Service Object Group', '');
    const onConfirm = () => {
      this.serviceObjectGroupService
        .removeServiceObjectFromGroupServiceObjectGroupServiceObject({
          serviceObjectGroupId: this.ServiceObjectGroupId,
          serviceObjectId: serviceObject.id,
        })
        .subscribe(() => {
          this.getGroupServiceObjects();
          this.getTierServiceObjects();
        });
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  getData() {
    const dto = Object.assign({}, this.ngx.getModalData('serviceObjectGroupModal') as ServiceObjectGroupModalDto);

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    this.ModalMode = dto.ModalMode;

    if (this.ModalMode === ModalMode.Edit) {
      this.ServiceObjectGroupId = dto.ServiceObjectGroup.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.type.enable();
    }

    const serviceObjectGroup = dto.ServiceObjectGroup;

    if (serviceObjectGroup !== undefined) {
      this.form.controls.name.setValue(serviceObjectGroup.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(serviceObjectGroup.description);
      this.form.controls.type.setValue(serviceObjectGroup.type);
      this.form.controls.type.disable();

      this.getGroupServiceObjects();
      this.getTierServiceObjects();
    }
    this.ngx.resetModalData('serviceObjectGroupModal');
  }

  private getTierServiceObjects() {
    this.tierService.getOneTier({ id: this.TierId, join: ['serviceObjects'] }).subscribe(data => {
      this.tierServiceObjects = data.serviceObjects.filter(
        tierObj => !this.serviceObjects.some(groupObj => groupObj.id === tierObj.id) && tierObj.deletedAt === null,
      );
    });
  }

  private getGroupServiceObjects() {
    this.serviceObjectGroupService
      .getOneServiceObjectGroup({
        id: this.ServiceObjectGroupId,
        join: ['serviceObjects'],
      })
      .subscribe(data => {
        this.serviceObjects = data.serviceObjects;
      });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      type: ['', Validators.required],
    });
  }

  public reset() {
    this.submitted = false;
    this.serviceObjects = new Array<ServiceObject>();
    this.selectedServiceObject = null;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
