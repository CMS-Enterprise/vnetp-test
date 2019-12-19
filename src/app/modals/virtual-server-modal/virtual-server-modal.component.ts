import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VirtualServer } from 'src/app/models/loadbalancer/virtual-server';
import {
  ValidateIpv4CidrAddress,
  ValidateIpv4Any,
} from 'src/app/validators/network-form-validators';
import { VirtualServerModalDto } from 'src/app/models/loadbalancer/virtual-server-modal-dto';
import { Pool } from 'src/app/models/loadbalancer/pool';
import { VirtualServerModalHelpText } from 'src/app/helptext/help-text-networking';
import { LoadBalancerPool, LoadBalancerIrule } from 'api_client';

@Component({
  selector: 'app-virtual-server-modal',
  templateUrl: './virtual-server-modal.component.html',
})
export class VirtualServerModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  pools: LoadBalancerPool[];
  availableIRules: LoadBalancerIrule[];
  selectedIRules: LoadBalancerIrule[];

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public helpText: VirtualServerModalHelpText,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const virtualServer = new VirtualServer();
    virtualServer.name = this.form.value.name;
    // virtualServer.type = this.form.value.type;
    virtualServer.sourceIpAddress = this.form.value.sourceAddress;
    virtualServer.destinationIpAddress = this.form.value.destinationAddress;
    // virtualServer.servicePort = this.form.value.servicePort;
    virtualServer.defaultPool = this.form.value.pool;
    virtualServer.irules = Object.assign([], this.selectedIRules);

    const dto = new VirtualServerModalDto();
    // dto.VirtualServer = virtualServer;

    this.ngx.resetModalData('virtualServerModal');
    this.ngx.setModalData(Object.assign({}, dto), 'virtualServerModal');
    this.ngx.close('virtualServerModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('virtualServerModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  private setFormValidators() {}

  getData() {
    // I don't think virtual server modal dto is aligned with API
    const dto = Object.assign(
      {},
      this.ngx.getModalData('virtualServerModal') as VirtualServerModalDto,
    );

    // this.pools = dto.Pools;

    const virtualServer = dto.VirtualServer;

    if (virtualServer !== undefined) {
      this.form.controls.name.setValue(virtualServer.name);
      // not sure what field this maps to in new api
      // this.form.controls.type.setValue(virtualServer.type);
      this.form.controls.sourceAddress.setValue(
        virtualServer.sourceAddressTranslation,
      );
      this.form.controls.destinationAddress.setValue(
        virtualServer.destinationIpAddress,
      );
      // is this the right field to map to? wrong
      // this.form.controls.servicePort.setValue(virtualServer.sourceIpAddress);
      this.form.controls.pool.setValue(virtualServer.defaultPool);

      if (dto.VirtualServer.irules) {
        this.selectedIRules = dto.VirtualServer.irules;
      }
    }

    // this.getAvailableIRules(dto.IRules.map(i => i.name));
    this.ngx.resetModalData('virtualServerModal');
  }

  private getAvailableIRules(irules: LoadBalancerIrule[]) {
    irules.forEach(irule => {
      if (!this.selectedIRules.includes(irule)) {
        this.availableIRules.push(irule);
      }
    });
  }

  selectIRule() {
    const irule = this.form.value.selectedIRule;

    if (!irule) {
      return;
    }

    this.selectedIRules.push(irule);
    const availableIndex = this.availableIRules.indexOf(irule);
    if (availableIndex > -1) {
      this.availableIRules.splice(availableIndex, 1);
    }
    this.form.controls.selectedIRule.setValue(null);
    this.form.controls.selectedIRule.updateValueAndValidity();
  }

  unselectIRule(irule) {
    this.availableIRules.push(irule);
    const selectedIndex = this.selectedIRules.indexOf(irule);
    if (selectedIndex > -1) {
      this.selectedIRules.splice(selectedIndex, 1);
    }
  }

  moveIRule(value: number, rule) {
    const ruleIndex = this.selectedIRules.indexOf(rule);

    // If the rule isn't in the array, is at the start of the array and requested to move up
    // or if the rule is at the end of the array, return.
    if (
      ruleIndex === -1 ||
      (ruleIndex === 0 && value === -1) ||
      ruleIndex + value === this.selectedIRules.length
    ) {
      return;
    }

    const nextRule = this.selectedIRules[ruleIndex + value];

    // If the next rule doesn't exist, return.
    if (nextRule === null) {
      return;
    }

    const nextRuleIndex = this.selectedIRules.indexOf(nextRule);

    [this.selectedIRules[ruleIndex], this.selectedIRules[nextRuleIndex]] = [
      this.selectedIRules[nextRuleIndex],
      this.selectedIRules[ruleIndex],
    ];
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      sourceAddress: ['', Validators.compose([ValidateIpv4Any])], // TODO: Optional in F5, should it be optional here?
      destinationAddress: [
        '',
        Validators.compose([Validators.required, ValidateIpv4Any]),
      ],
      servicePort: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(65535),
        ]),
      ],
      pool: ['', Validators.required],
      selectedIRule: [''],
    });

    this.availableIRules = new Array<LoadBalancerIrule>();
    this.selectedIRules = new Array<LoadBalancerIrule>();
  }

  private unsubAll() {}

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
