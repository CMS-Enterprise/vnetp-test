import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  ValidateIpv4Any,
  ValidateIpv4Address,
} from 'src/app/validators/network-form-validators';
import { Subscription } from 'rxjs';
import { PoolMemberModalHelpText } from 'src/app/helptext/help-text-networking';
import { PoolMember } from 'src/app/models/loadbalancer/pool-member';
import {
  LoadBalancerNode,
  V1LoadBalancerNodesService,
  V1LoadBalancerPoolsService,
} from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';

@Component({
  selector: 'app-pool-member-modal',
  templateUrl: './pool-member-modal.component.html',
})
export class PoolMemberModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  typeSubscription: Subscription;
  TierId: string;
  PoolId: string;
  NodeId: string;
  ModalMode: ModalMode;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public poolService: V1LoadBalancerPoolsService,
    public helpText: PoolMemberModalHelpText,
    public nodeService: V1LoadBalancerNodesService,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const poolMember = {} as LoadBalancerNode;
    poolMember.name = this.form.value.name;
    poolMember.type = this.form.value.type;
    if (poolMember.type === 'IpAddress') {
      poolMember.ipAddress = this.form.value.ipAddress;
    } else {
      poolMember.fqdn = this.form.value.fqdn;
    }
    if (this.form.value.autoPopulate) {
      poolMember.autoPopulate = this.form.value.autoPopulate;
    } else {
      poolMember.autoPopulate = false;
    }
    poolMember.servicePort = this.form.value.servicePort;

    if (this.ModalMode === ModalMode.Create) {
      poolMember.tierId = this.TierId;
      this.nodeService
        .v1LoadBalancerNodesPost({
          loadBalancerNode: poolMember,
        })
        .subscribe(
          data => {
            this.NodeId = data.id;
            this.savePoolMember(data.id);
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.nodeService
        .v1LoadBalancerNodesIdPut({
          id: this.NodeId,
          loadBalancerNode: poolMember,
        })
        .subscribe(data => {
          this.NodeId = data.id;
        });
    }
    this.ngx.resetModalData('poolMemberModal');
    this.ngx.setModalData(Object.assign({}, poolMember), 'poolMemberModal');
    this.ngx.close('poolMemberModal');
    this.reset();
  }

  savePoolMember(nodeId: string) {
    this.poolService
      .v1LoadBalancerPoolsPoolIdNodeNodeIdPost({
        poolId: this.PoolId,
        nodeId,
      })
      .subscribe(data => {});
  }

  private closeModal() {
    this.ngx.close('poolMemberModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('poolMemberModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  private setFormValidators() {
    const fqdn = this.form.get('fqdn');
    const autoPopulate = this.form.get('autoPopulate');
    const ipAddress = this.form.get('ipAddress');

    this.typeSubscription = this.form
      .get('type')
      .valueChanges.subscribe(type => {
        if (type === 'ipaddress') {
          ipAddress.setValidators(
            Validators.compose([Validators.required, ValidateIpv4Address]),
          );
          ipAddress.setValue(null);
          fqdn.setValidators(null);
          fqdn.setValue(null);
          autoPopulate.setValue(false);
        }

        if (type === 'fqdn') {
          // TODO: Write FQDN Validator
          fqdn.setValidators(Validators.compose([Validators.required]));
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
    const poolMember = Object.assign(
      {},
      this.ngx.getModalData('poolMemberModal') as any,
    );
    this.TierId = poolMember.TierId;
    this.PoolId = poolMember.PoolId;

    if (!poolMember.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = poolMember.ModalMode;
      if (poolMember.ModalMode === ModalMode.Edit) {
        this.NodeId = poolMember.node.id;
        this.PoolId = poolMember.poolId;
      }
    }

    if (poolMember !== undefined) {
      this.form.controls.name.setValue(poolMember.node.name);
      this.form.controls.type.setValue(poolMember.node.type);
      this.form.controls.ipAddress.setValue(poolMember.node.ipAddress);
      this.form.controls.fqdn.setValue(poolMember.node.fqdn);
      this.form.controls.autoPopulate.setValue(poolMember.node.autoPopulate);
      this.form.controls.servicePort.setValue(poolMember.node.servicePort);
    }
    this.ngx.resetModalData('poolMemberModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      ipAddress: [''],
      fqdn: [''],
      autoPopulate: [false],
      servicePort: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(65535),
        ]),
      ],
    });
  }

  private unsubAll() {
    if (this.typeSubscription) {
      this.typeSubscription.unsubscribe();
    }
  }

  private reset() {
    this.unsubAll();
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
