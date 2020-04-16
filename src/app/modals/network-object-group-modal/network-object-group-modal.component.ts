import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NetworkObjectGroupModalDto } from 'src/app/models/network-objects/network-object-group-modal-dto';
import { Subnet } from 'src/app/models/d42/subnet';
import { NetworkObjectGroupModalHelpText } from 'src/app/helptext/help-text-networking';
import { V1NetworkSecurityNetworkObjectGroupsService, NetworkObject, NetworkObjectGroup, V1TiersService } from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-network-object-group-modal',
  templateUrl: './network-object-group-modal.component.html',
})
export class NetworkObjectGroupModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  networkObjects: Array<NetworkObject>;
  tierNetworkObjects: Array<NetworkObject>;
  Subnets: Array<Subnet>;
  TierId: string;
  ModalMode: ModalMode;
  NetworkObjectGroupId: string;

  selectedNetworkObject: NetworkObject;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private tierService: V1TiersService,
    public helpText: NetworkObjectGroupModalHelpText,
  ) {
    this.networkObjects = new Array<NetworkObject>();
  }

  save() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const modalNetworkObjectGroup = {} as NetworkObjectGroup;

    modalNetworkObjectGroup.name = this.form.value.name;
    modalNetworkObjectGroup.description = this.form.value.description;

    if (this.ModalMode === ModalMode.Create) {
      modalNetworkObjectGroup.tierId = this.TierId;
      this.networkObjectGroupService
        .v1NetworkSecurityNetworkObjectGroupsPost({
          networkObjectGroup: modalNetworkObjectGroup,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.networkObjectGroupService
        .v1NetworkSecurityNetworkObjectGroupsIdPut({
          id: this.NetworkObjectGroupId,
          networkObjectGroup: modalNetworkObjectGroup,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    }
  }

  private closeModal() {
    this.ngx.close('networkObjectGroupModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('networkObjectGroupModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  addNetworkObject() {
    this.networkObjectGroupService
      .v1NetworkSecurityNetworkObjectGroupsNetworkObjectGroupIdNetworkObjectsNetworkObjectIdPost({
        networkObjectGroupId: this.NetworkObjectGroupId,
        networkObjectId: this.selectedNetworkObject.id,
      })
      .subscribe(data => {
        this.selectedNetworkObject = null;
        this.getGroupNetworkObjects();
      });
  }

  removeNetworkObject(networkObject: NetworkObject) {
    const modalDto = new YesNoModalDto('Remove Network Object from Network Object Group', '');
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (data && data.modalYes) {
        this.networkObjectGroupService
          .v1NetworkSecurityNetworkObjectGroupsNetworkObjectGroupIdNetworkObjectsNetworkObjectIdDelete({
            networkObjectGroupId: this.NetworkObjectGroupId,
            networkObjectId: networkObject.id,
          })
          .subscribe(() => {
            this.getGroupNetworkObjects();
          });
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  getData() {
    const dto = Object.assign({}, this.ngx.getModalData('networkObjectGroupModal') as NetworkObjectGroupModalDto);

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.NetworkObjectGroupId = dto.NetworkObjectGroup.id;
      } else {
        this.form.controls.name.enable();
      }
    }

    const networkObjectGroup = dto.NetworkObjectGroup;

    if (networkObjectGroup !== undefined) {
      this.form.controls.name.setValue(networkObjectGroup.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(networkObjectGroup.description);

      this.getGroupNetworkObjects();
      this.getTierNetworkObjects();
    }
    this.ngx.resetModalData('networkObjectGroupModal');
  }

  private getTierNetworkObjects() {
    this.tierService.v1TiersIdGet({ id: this.TierId, join: 'networkObjects' }).subscribe(data => {
      this.tierNetworkObjects = data.networkObjects;
    });
  }

  private getGroupNetworkObjects() {
    this.networkObjectGroupService
      .v1NetworkSecurityNetworkObjectGroupsIdGet({
        id: this.NetworkObjectGroupId,
        join: 'networkObjects',
      })
      .subscribe(data => {
        this.networkObjects = data.networkObjects;
      });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, NameValidator])],
      description: [''],
    });
  }

  public reset() {
    this.submitted = false;
    this.networkObjects = new Array<NetworkObject>();
    this.Subnets = new Array<Subnet>();
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {}
}
