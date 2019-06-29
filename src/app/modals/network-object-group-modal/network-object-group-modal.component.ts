import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { NetworkObject } from 'src/app/models/network-objects/network-object';
import { Subscription } from 'rxjs';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NetworkObjectGroup } from 'src/app/models/network-objects/network-object-group';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { HelpersService } from 'src/app/services/helpers.service';
import { NetworkObjectModalDto } from 'src/app/models/network-objects/network-object-modal-dto';
import { NetworkObjectGroupModalDto } from 'src/app/models/network-objects/network-object-group-modal-dto';
import { Subnet } from 'src/app/models/d42/subnet';

@Component({
  selector: 'app-network-object-group-modal',
  templateUrl: './network-object-group-modal.component.html',
  styleUrls: ['./network-object-group-modal.component.css']
})
export class NetworkObjectGroupModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  networkObjects: Array<NetworkObject>;
  Subnets: Array<Subnet>;

  editNetworkObjectIndex: number;

  networkObjectModalSubscription: Subscription;

  networkObjectModalMode: ModalMode;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder, private hs: HelpersService) {
    this.networkObjects = new Array<NetworkObject>();
   }

   save() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const networkObjectGroup = new NetworkObjectGroup();

    networkObjectGroup.Name = this.form.value.name;
    networkObjectGroup.Description = this.form.value.description;
    networkObjectGroup.NetworkObjects = Object.assign([], this.networkObjects);

    this.ngx.resetModalData('networkObjectGroupModal');
    this.ngx.setModalData(networkObjectGroup, 'networkObjectGroupModal');
    this.ngx.close('networkObjectGroupModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('networkObjectGroupModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  deleteNetworkObject(networkObject: NetworkObject) {
    const index = this.networkObjects.indexOf(networkObject);
    if ( index > -1) {
      this.networkObjects.splice(index, 1);
    }
  }

  saveNetworkObject(networkObject: NetworkObject) {
    if (this.networkObjectModalMode === ModalMode.Create) {
      this.networkObjects.push(networkObject);
    } else {
      this.networkObjects[this.editNetworkObjectIndex] = networkObject;
    }
  }

  createNetworkObject() {
    this.subscribeToNetworkObjectModal();
    this.networkObjectModalMode = ModalMode.Create;

    const dto = new NetworkObjectModalDto();
    dto.Subnets = this.Subnets;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'networkObjectModal');
    this.ngx.getModal('networkObjectModal').toggle();
  }

  editNetworkObject(networkObject: NetworkObject) {
    this.subscribeToNetworkObjectModal();
    this.networkObjectModalMode = ModalMode.Edit;

    const dto = new NetworkObjectModalDto();
    dto.Subnets = this.Subnets;
    dto.NetworkObject = networkObject;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'networkObjectModal');
    this.editNetworkObjectIndex = this.networkObjects.indexOf(networkObject);
    this.ngx.getModal('networkObjectModal').toggle();
  }

  subscribeToNetworkObjectModal() {
    this.networkObjectModalSubscription =
    this.ngx.getModal('networkObjectModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as NetworkObjectModalDto;

      if (data && data.NetworkObject) {
        this.saveNetworkObject(data.NetworkObject);
      }
      this.ngx.resetModalData('networkObjectModal');
      this.networkObjectModalSubscription.unsubscribe();
    });
  }

  getData() {
    const dto = Object.assign({}, this.ngx.getModalData('networkObjectGroupModal') as NetworkObjectGroupModalDto);
    
    if (dto.Subnets) {
      this.Subnets = dto.Subnets;
    }

    const networkObjectGroup = dto.NetworkObjectGroup;

    if (networkObjectGroup !== undefined) {
      this.form.controls.name.setValue(networkObjectGroup.Name);
      this.form.controls.description.setValue(networkObjectGroup.Description);
      if (networkObjectGroup.NetworkObjects) {
        this.networkObjects = networkObjectGroup.NetworkObjects;
      } else {
        this.networkObjects = new Array<NetworkObject>();
      }
    }
    this.ngx.resetModalData('networkObjectGroupModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  private unsubAll() {
    if (this.networkObjectModalSubscription) {
      this.networkObjectModalSubscription.unsubscribe();
    }
  }

  private reset() {
    this.unsubAll();
    this.submitted = false;
    this.networkObjects = new Array<NetworkObject>();
    this.Subnets = new Array<Subnet>();
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
