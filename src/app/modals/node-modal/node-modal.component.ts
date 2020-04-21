import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IpAddressIpValidator, FqdnValidator } from 'src/app/validators/network-form-validators';
import { Subscription } from 'rxjs';
import { NodeModalHelpText } from 'src/app/helptext/help-text-networking';
import { LoadBalancerNode, V1LoadBalancerNodesService, V1LoadBalancerPoolsService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NodeModalDto } from 'src/app/models/loadbalancer/node-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-node-modal',
  templateUrl: './node-modal.component.html',
})
export class NodeModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  typeSubscription: Subscription;
  TierId: string;
  PoolId: string;
  Node: LoadBalancerNode;
  ModalMode: ModalMode;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public poolService: V1LoadBalancerPoolsService,
    public helpText: NodeModalHelpText,
    public nodeService: V1LoadBalancerNodesService,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const node = {} as LoadBalancerNode;
    node.name = this.form.value.name;
    node.type = this.form.value.type;
    if (node.type === 'IpAddress') {
      node.ipAddress = this.form.value.ipAddress;
      node.autoPopulate = null;
    } else {
      if (this.form.value.autoPopulate) {
        node.autoPopulate = this.form.value.autoPopulate;
      } else {
        node.autoPopulate = false;
      }
      node.fqdn = this.form.value.fqdn;
    }
    // node.servicePort = this.form.value.servicePort;
    // node.priority = this.form.value.priority;

    if (this.ModalMode === ModalMode.Create) {
      node.tierId = this.TierId;
      this.nodeService
        .v1LoadBalancerNodesPost({
          loadBalancerNode: node,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.nodeService
        .v1LoadBalancerNodesIdPut({
          id: this.Node.id,
          loadBalancerNode: node,
        })
        .subscribe(data => {
          this.closeModal();
        });
    }
  }

  private closeModal() {
    this.ngx.close('nodeModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('nodeModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  private setFormValidators() {
    const fqdn = this.form.get('fqdn');
    const autoPopulate = this.form.get('autoPopulate');
    const ipAddress = this.form.get('ipAddress');

    this.typeSubscription = this.form.get('type').valueChanges.subscribe(type => {
      if (type === 'IpAddress') {
        ipAddress.setValidators(Validators.compose([Validators.required, IpAddressIpValidator]));
        ipAddress.setValue(null);
        fqdn.setValidators(null);
        fqdn.setValue(null);
        autoPopulate.setValue(false);
      }

      if (type === 'Fqdn') {
        fqdn.setValidators(Validators.compose([Validators.required, FqdnValidator]));
        fqdn.setValue(null);
        ipAddress.setValidators(null);
        ipAddress.setValue(null);
        autoPopulate.setValue(false);
      }

      fqdn.updateValueAndValidity();
      autoPopulate.updateValueAndValidity();
      ipAddress.updateValueAndValidity();
    });
  }

  getData() {
    const nodeDto = Object.assign({}, this.ngx.getModalData('nodeModal') as NodeModalDto);
    this.TierId = nodeDto.TierId;
    this.PoolId = nodeDto.PoolId;
    const node = nodeDto.node;
    if (!nodeDto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = nodeDto.ModalMode;
      if (nodeDto.ModalMode === ModalMode.Edit) {
        this.Node = node;
      } else {
        this.form.controls.name.enable();
      }
    }

    if (node !== undefined) {
      this.form.controls.name.setValue(node.name);
      this.form.controls.name.disable();
      this.form.controls.type.setValue(node.type);
      this.form.controls.ipAddress.setValue(node.ipAddress);
      this.form.controls.fqdn.setValue(node.fqdn);
      this.form.controls.autoPopulate.setValue(node.autoPopulate);
      // this.form.controls.servicePort.setValue(node.servicePort);
      // this.form.controls.priority.setValue(node.priority);
    }
    this.ngx.resetModalData('nodeModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      type: ['', Validators.required],
      ipAddress: [''],
      fqdn: [''],
      autoPopulate: [false],
      // servicePort: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(65535)])],
      // priority: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(100)])],
    });
  }

  private unsubAll() {
    if (this.typeSubscription) {
      this.typeSubscription.unsubscribe();
    }
  }

  public reset() {
    this.unsubAll();
    this.submitted = false;
    this.ngx.resetModalData('nodeModal');
    this.buildForm();
    this.setFormValidators();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
