import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NodeModalHelpText } from 'src/app/helptext/help-text-networking';
import { LoadBalancerNode, LoadBalancerNodeTypeEnum, V1LoadBalancerNodesService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { NodeModalDto } from './node-modal.dto';
import ValidatorUtil from 'src/app/utils/ValidatorUtil';
import { FqdnValidator, IpAddressIpValidator } from 'src/app/validators/network-form-validators';
import { Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { nodeTypeLookup } from 'src/app/lookups/load-balancer-node-type.lookup';

@Component({
  selector: 'app-node-modal',
  templateUrl: './node-modal.component.html',
})
export class NodeModalComponent implements OnInit, OnDestroy {
  public form: UntypedFormGroup;
  public submitted: boolean;

  public NodeType = LoadBalancerNodeTypeEnum;
  public nodeTypeLookup = nodeTypeLookup;
  public nodeTypes: LoadBalancerNodeTypeEnum[] = Object.keys(LoadBalancerNodeTypeEnum).map(k => LoadBalancerNodeTypeEnum[k]);

  private nodeId: string;
  private modalMode: ModalMode;
  private tierId: string;
  private typeChanges: Subscription;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: UntypedFormBuilder,
    private nodeService: V1LoadBalancerNodesService,
    public helpText: NodeModalHelpText,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.typeChanges]);
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('nodeModal');
    this.submitted = false;
    SubscriptionUtil.unsubscribe([this.typeChanges]);
    this.buildForm();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const node = this.getNodeForSave();

    if (this.modalMode === ModalMode.Create) {
      this.createNode(node);
    } else {
      this.updateNode(node);
    }
  }

  public getData(): void {
    const dto: NodeModalDto = Object.assign({}, this.ngx.getModalData('nodeModal')) as any;
    const { node, tierId } = dto;
    this.tierId = tierId;
    this.modalMode = node ? ModalMode.Edit : ModalMode.Create;

    if (this.modalMode === ModalMode.Edit) {
      const { name, type, ipAddress, fqdn, autoPopulate, id } = node;
      this.nodeId = id;

      this.form.controls.name.disable();
      if (type === LoadBalancerNodeTypeEnum.IpAddress) {
        this.form.controls.autoPopulate.setValue(autoPopulate);
        this.form.controls.fqdn.setValue(null);
        this.form.controls.ipAddress.setValue(ipAddress);
        this.form.controls.name.setValue(name);
        this.form.controls.type.setValue(type);
      } else {
        this.form.controls.autoPopulate.setValue(autoPopulate);
        this.form.controls.fqdn.setValue(fqdn);
        this.form.controls.ipAddress.setValue(null);
        this.form.controls.name.setValue(name);
        this.form.controls.type.setValue(type);
      }
    } else {
      this.form.controls.name.enable();
    }

    this.typeChanges = this.subscribeToTypeChanges();

    this.ngx.resetModalData('nodeModal');
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      type: ['', Validators.required],
      ipAddress: [
        '',
        Validators.compose([
          IpAddressIpValidator,
          ValidatorUtil.optionallyRequired(() => this.form.get('type').value === LoadBalancerNodeTypeEnum.IpAddress),
        ]),
      ],
      fqdn: [
        '',
        Validators.compose([
          FqdnValidator,
          ValidatorUtil.optionallyRequired(() => this.form.get('type').value === LoadBalancerNodeTypeEnum.Fqdn),
        ]),
      ],
      autoPopulate: [false],
    });
  }

  private createNode(loadBalancerNode: LoadBalancerNode): void {
    this.nodeService.createOneLoadBalancerNode({ loadBalancerNode }).subscribe(
      () => this.closeModal(),
      () => {},
    );
  }

  private updateNode(loadBalancerNode: LoadBalancerNode): void {
    loadBalancerNode.tierId = null;
    this.nodeService
      .updateOneLoadBalancerNode({
        id: this.nodeId,
        loadBalancerNode,
      })
      .subscribe(
        () => this.closeModal(),
        () => {},
      );
  }

  private getNodeForSave(): LoadBalancerNode {
    const { name, type, ipAddress, autoPopulate, fqdn } = this.form.value;

    if (type === LoadBalancerNodeTypeEnum.IpAddress) {
      return {
        ipAddress,
        name,
        type,
        autoPopulate: null,
        fqdn: null,
        tierId: this.tierId,
      };
    }

    return {
      fqdn,
      name,
      type,
      autoPopulate: !!autoPopulate || false,
      ipAddress: null,
      tierId: this.tierId,
    };
  }

  private subscribeToTypeChanges(): Subscription {
    const fqdn = this.form.get('fqdn');
    const autoPopulate = this.form.get('autoPopulate');
    const ipAddress = this.form.get('ipAddress');

    const types = new Set([LoadBalancerNodeTypeEnum.IpAddress, LoadBalancerNodeTypeEnum.Fqdn]);

    return this.form.get('type').valueChanges.subscribe((type: LoadBalancerNodeTypeEnum) => {
      if (!types.has(type)) {
        return;
      }

      autoPopulate.setValue(false);
      fqdn.setValue(null);
      ipAddress.setValue(null);

      autoPopulate.updateValueAndValidity();
      fqdn.updateValueAndValidity();
      ipAddress.updateValueAndValidity();
    });
  }
}
