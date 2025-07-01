import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NetworkObjectGroupModalDto } from 'src/app/models/network-objects/network-object-group-modal-dto';
import { NetworkObjectGroupModalHelpText } from 'src/app/helptext/help-text-networking';
import { V1NetworkSecurityNetworkObjectGroupsService, NetworkObject, NetworkObjectGroup, V1TiersService } from 'client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-network-object-group-modal',
  templateUrl: './network-object-group-modal.component.html',
})
export class NetworkObjectGroupModalComponent implements OnInit {
  form: UntypedFormGroup;
  submitted: boolean;
  networkObjects: NetworkObject[] = [];
  tierNetworkObjects: NetworkObject[];
  TierId: string;
  ModalMode: ModalMode;
  NetworkObjectGroupId: string;

  selectedNetworkObject: NetworkObject;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: UntypedFormBuilder,
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
        .createOneNetworkObjectGroup({
          networkObjectGroup: modalNetworkObjectGroup,
        })
        .subscribe(() => {
          this.closeModal();
        });
    } else {
      this.networkObjectGroupService
        .updateOneNetworkObjectGroup({
          id: this.NetworkObjectGroupId,
          networkObjectGroup: modalNetworkObjectGroup,
        })
        .subscribe(() => {
          this.closeModal();
        });
    }
  }

  private closeModal() {
    this.ngx.close('networkObjectGroupModal');
  }

  cancel() {
    this.ngx.close('networkObjectGroupModal');
  }

  get f() {
    return this.form.controls;
  }

  addNetworkObject() {
    this.networkObjectGroupService
      .addNetworkObjectToGroupNetworkObjectGroup({
        networkObjectGroupId: this.NetworkObjectGroupId,
        networkObjectId: this.selectedNetworkObject.id,
      })
      .subscribe(() => {
        this.selectedNetworkObject = null;
        this.getGroupNetworkObjects();
        this.getTierNetworkObjects();
      });
  }

  public removeNetworkObject(networkObject: NetworkObject): void {
    const modalDto = new YesNoModalDto('Remove Network Object from Network Object Group', '');
    const onConfirm = () => {
      this.networkObjectGroupService
        .removeNetworkObjectFromGroupNetworkObjectGroup({
          networkObjectGroupId: this.NetworkObjectGroupId,
          networkObjectId: networkObject.id,
        })
        .subscribe(() => {
          this.getGroupNetworkObjects();
          this.getTierNetworkObjects();
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

    if (networkObjectGroup) {
      this.form.controls.name.setValue(networkObjectGroup.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(networkObjectGroup.description);

      this.getGroupNetworkObjects();
      this.getTierNetworkObjects();
    }
    this.ngx.resetModalData('networkObjectGroupModal');
  }

  private getTierNetworkObjects() {
    this.tierService.getOneTier({ id: this.TierId, join: ['networkObjects'] }).subscribe(data => {
      this.tierNetworkObjects = data.networkObjects.filter(
        tierObj => !this.networkObjects.some(groupObj => groupObj.id === tierObj.id) && tierObj.deletedAt === null,
      );
    });
  }

  private getGroupNetworkObjects() {
    this.networkObjectGroupService
      .getOneNetworkObjectGroup({
        id: this.NetworkObjectGroupId,
        join: ['networkObjects'],
      })
      .subscribe(data => {
        this.networkObjects = data.networkObjects;
      });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
    });
  }

  public reset() {
    this.submitted = false;
    this.networkObjects = [];
    this.selectedNetworkObject = null;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
