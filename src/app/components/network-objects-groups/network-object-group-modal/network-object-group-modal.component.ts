import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NetworkObjectGroupModalDto } from 'src/app/models/network-objects/network-object-group-modal-dto';
import { NetworkObjectGroupModalHelpText } from 'src/app/helptext/help-text-networking';
import { V1NetworkSecurityNetworkObjectGroupsService, NetworkObject, NetworkObjectGroup, V1TiersService } from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-network-object-group-modal',
  templateUrl: './network-object-group-modal.component.html',
})
export class NetworkObjectGroupModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  networkObjects: NetworkObject[] = [];
  tierNetworkObjects: NetworkObject[];
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
  ) {}

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
          () => {
            this.closeModal();
          },
          () => {},
        );
    } else {
      this.networkObjectGroupService
        .v1NetworkSecurityNetworkObjectGroupsIdPut({
          id: this.NetworkObjectGroupId,
          networkObjectGroup: modalNetworkObjectGroup,
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
      .subscribe(() => {
        this.selectedNetworkObject = null;
        this.getGroupNetworkObjects();
      });
  }

  public removeNetworkObject(networkObject: NetworkObject): void {
    const modalDto = new YesNoModalDto('Remove Network Object from Network Object Group', '');
    const onConfirm = () => {
      this.networkObjectGroupService
        .v1NetworkSecurityNetworkObjectGroupsNetworkObjectGroupIdNetworkObjectsNetworkObjectIdDelete({
          networkObjectGroupId: this.NetworkObjectGroupId,
          networkObjectId: networkObject.id,
        })
        .subscribe(() => {
          this.getGroupNetworkObjects();
        });
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  getData() {
    const dto = Object.assign({}, this.ngx.getModalData('networkObjectGroupModal') as NetworkObjectGroupModalDto);

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    this.ModalMode = dto.ModalMode;

    if (this.ModalMode === ModalMode.Edit) {
      this.NetworkObjectGroupId = dto.NetworkObjectGroup.id;
    } else {
      this.form.controls.name.enable();
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
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
    });
  }

  public reset() {
    this.submitted = false;
    this.networkObjects = [];
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
