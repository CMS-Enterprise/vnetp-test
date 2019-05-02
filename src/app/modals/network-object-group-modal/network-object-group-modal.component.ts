import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { NetworkObject } from 'src/app/models/network-object';
import { Subscription } from 'rxjs';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NetworkObjectGroup } from 'src/app/models/network-object-group';
import { ModalMode } from 'src/app/models/modal-mode';

@Component({
  selector: 'app-network-object-group-modal',
  templateUrl: './network-object-group-modal.component.html',
  styleUrls: ['./network-object-group-modal.component.css']
})
export class NetworkObjectGroupModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  networkObjects: Array<NetworkObject>;

  editNetworkObjectIndex: number;

  networkObjectModalSubscription: Subscription;
  networkObjectGroupModalSubscription: Subscription;

  networkObjectModalMode: ModalMode;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
    this.networkObjects = new Array<NetworkObject>();
   }

  createNetworkObject() {
    this.subscribeToNetworkObjectModal();
    this.networkObjectModalMode = ModalMode.Create;
    this.ngx.open('networkObjectModal');
  }

  editNetworkObject(networkObject : NetworkObject) {
    this.subscribeToNetworkObjectModal();
    this.networkObjectModalMode = ModalMode.Edit;
    this.ngx.setModalData(Object.assign({}, networkObject), 'networkObjectModal');
    this.editNetworkObjectIndex = this.networkObjects.indexOf(networkObject);
    this.ngx.getModal('networkObjectModal').open();
  }

  subscribeToNetworkObjectModal() {
    this.networkObjectModalSubscription =
    this.ngx.getModal('networkObjectModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as NetworkObject;

      if (data !== undefined) {
        data = Object.assign({}, data);
        this.saveNetworkObject(data);
      }
      this.ngx.resetModalData('networkObjectModal');
      this.networkObjectModalSubscription.unsubscribe();
    });
  }

  saveNetworkObject(networkObject: NetworkObject) {
    if (this.networkObjectModalMode === ModalMode.Create) {
      this.networkObjects.push(networkObject);
    } else {
      this.networkObjects[this.editNetworkObjectIndex] = networkObject;
    }
  }

  save() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const networkObjectGroup = new NetworkObjectGroup();

    networkObjectGroup.Name = this.form.value.name;
    networkObjectGroup.Description = this.form.value.Description;
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

  ngOnInit() {
    this.buildForm();

    setTimeout(() => {
      this.ngx.getModal('networkObjectGroupModal').onOpen.subscribe((modal: NgxSmartModalComponent) => {
        const networkObjectGroup = Object.assign({}, modal.getData() as NetworkObjectGroup);
        if (networkObjectGroup !== undefined) {
        this.form.controls.name.setValue(networkObjectGroup.Name);
        this.form.controls.description.setValue(networkObjectGroup.Description);
        if (networkObjectGroup.NetworkObjects) {
          this.networkObjects = networkObjectGroup.NetworkObjects;
        } else {
          this.networkObjects = new Array<NetworkObject>();
        }
        }
      });
    }, 1 * 1000);
    // Delay on subscribe since smart modal service
    // must first discover all modals.
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  private reset() {
    this.submitted = false;
    this.networkObjects = new Array<NetworkObject>();
    this.buildForm();
  }
}
