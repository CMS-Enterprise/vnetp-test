import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { ServiceObjectGroupModalHelpText } from 'src/app/helptext/help-text-networking';
import {
  ServiceObject,
  ServiceObjectGroup,
  V1NetworkSecurityServiceObjectGroupsService,
  V1TiersService,
} from 'api_client';
import { ServiceObjectGroupModalDto } from 'src/app/models/service-objects/service-object-group-modal-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-service-object-group-modal',
  templateUrl: './service-object-group-modal.component.html',
})
export class ServiceObjectGroupModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  serviceObjects: Array<ServiceObject>;
  TierId: string;
  ModalMode: ModalMode;
  tierServiceObjects: Array<ServiceObject>;
  ServiceObjectGroupId: string;
  selectedServiceObject: ServiceObject;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
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
        .v1NetworkSecurityServiceObjectGroupsPost({
          serviceObjectGroup: modalServiceObjectGroup,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.serviceObjectGroupService
        .v1NetworkSecurityServiceObjectGroupsIdPut({
          id: this.ServiceObjectGroupId,
          serviceObjectGroup: modalServiceObjectGroup,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    }

    this.closeModal();
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
      .v1NetworkSecurityServiceObjectGroupsServiceObjectGroupIdServiceObjectsServiceObjectIdPost(
        {
          serviceObjectGroupId: this.ServiceObjectGroupId,
          serviceObjectId: this.selectedServiceObject.id,
        },
      )
      .subscribe(data => {
        this.selectedServiceObject = null;
        this.getGroupServiceObjects();
      });
  }

  removeServiceObject(serviceObject: ServiceObject) {
    const modalDto = new YesNoModalDto(
      'Remove Service Object from Service Object Group',
      '',
    );
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (data && data.modalYes) {
          this.serviceObjectGroupService
            .v1NetworkSecurityServiceObjectGroupsServiceObjectGroupIdServiceObjectsServiceObjectIdDelete(
              {
                serviceObjectGroupId: this.ServiceObjectGroupId,
                serviceObjectId: serviceObject.id,
              },
            )
            .subscribe(() => {
              this.getGroupServiceObjects();
            });
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  getData() {
    const dto = Object.assign(
      {},
      this.ngx.getModalData(
        'serviceObjectGroupModal',
      ) as ServiceObjectGroupModalDto,
    );

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.ServiceObjectGroupId = dto.ServiceObjectGroup.id;
      }

      if (this.ModalMode === ModalMode.Create) {
        this.form.controls.type.enable();
      }
    }

    const serviceObjectGroup = dto.ServiceObjectGroup;

    if (serviceObjectGroup !== undefined) {
      this.form.controls.name.setValue(serviceObjectGroup.name);
      this.form.controls.description.setValue(serviceObjectGroup.description);
      this.form.controls.type.setValue(serviceObjectGroup.type);
      this.form.controls.type.disable();

      this.getGroupServiceObjects();
      this.getTierServiceObjects();
    }
    this.ngx.resetModalData('serviceObjectGroupModal');
  }

  private getTierServiceObjects() {
    this.tierService
      .v1TiersIdGet({ id: this.TierId, join: 'serviceObjects' })
      .subscribe(data => {
        this.tierServiceObjects = data.serviceObjects;
      });
  }

  private getGroupServiceObjects() {
    this.serviceObjectGroupService
      .v1NetworkSecurityServiceObjectGroupsIdGet({
        id: this.ServiceObjectGroupId,
        join: 'serviceObjects',
      })
      .subscribe(data => {
        this.serviceObjects = data.serviceObjects;
      });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
    });
  }

  private reset() {
    this.submitted = false;
    this.serviceObjects = new Array<ServiceObject>();
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {}
}
