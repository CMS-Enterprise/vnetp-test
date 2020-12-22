import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NodeModalHelpText } from 'src/app/helptext/help-text-networking';
import { LoadBalancerNode, LoadBalancerNodeType, V1LoadBalancerNodesService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { NodeModalDto } from './node-modal.dto';
import ValidatorUtil from 'src/app/utils/ValidatorUtil';
import { FqdnValidator, IpAddressIpValidator } from 'src/app/validators/network-form-validators';
import { Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-node-modal',
  templateUrl: './node-modal.component.html',
})
export class NodeModalComponent implements OnInit {
  public form: FormGroup;
  public submitted: boolean;
  public NodeType = LoadBalancerNodeType;

  private nodeId: string;
  private modalMode: ModalMode;
  private tierId: string;
  private typeChanges: Subscription;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
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
    const dto: NodeModalDto = Object.assign({}, this.ngx.getModalData('nodeModal'));
    const { node, tierId } = dto;
    this.tierId = tierId;
    this.modalMode = node ? ModalMode.Edit : ModalMode.Create;

    if (this.modalMode === ModalMode.Edit) {
      const { name, type, ipAddress, fqdn, autoPopulate, id } = node;
      this.nodeId = id;

      this.form.controls.name.disable();

      this.form.controls.autoPopulate.setValue(autoPopulate);
      this.form.controls.fqdn.setValue(fqdn);
      this.form.controls.ipAddress.setValue(ipAddress);
      this.form.controls.name.setValue(name);
      this.form.controls.type.setValue(type);
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
          ValidatorUtil.optionallyRequired(() => this.form.get('type').value === LoadBalancerNodeType.IpAddress),
        ]),
      ],
      fqdn: [
        '',
        Validators.compose([
          FqdnValidator,
          ValidatorUtil.optionallyRequired(() => this.form.get('type').value === LoadBalancerNodeType.Fqdn),
        ]),
      ],
      autoPopulate: [false],
    });
  }

  private createNode(node: LoadBalancerNode): void {
    this.nodeService
      .v1LoadBalancerNodesPost({
        loadBalancerNode: node,
      })
      .subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
  }

  private updateNode(node: LoadBalancerNode): void {
    node.tierId = undefined;
    this.nodeService
      .v1LoadBalancerNodesIdPut({
        id: this.nodeId,
        loadBalancerNode: node,
      })
      .subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
  }

  private getNodeForSave(): LoadBalancerNode {
    const { name, type, ipAddress, autoPopulate, fqdn } = this.form.value;

    if (type === LoadBalancerNodeType.IpAddress) {
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

    const types = new Set([LoadBalancerNodeType.IpAddress, LoadBalancerNodeType.Fqdn]);

    return this.form.get('type').valueChanges.subscribe((type: LoadBalancerNodeType) => {
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
