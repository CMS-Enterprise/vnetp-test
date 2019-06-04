// TODO: Currently we are doing a 1:1 mapping of VLAN:Subnet.
// To support multiple subnets per VLAN and also use proper
// terminology, native and tagged should refer to VLANs.

import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LogicalInterface } from 'src/app/models/network/logical-interface';
import { HelpersService } from 'src/app/services/helpers.service';
import { LogicalInterfaceModalDto } from 'src/app/models/interfaces/logical-interface-modal-dto';

@Component({
  selector: 'app-logical-interface-modal',
  templateUrl: './logical-interface-modal.component.html',
  styleUrls: ['./logical-interface-modal.component.css']
})
export class LogicalInterfaceModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;


  selectedSubnets = new Array<string>();
  availableSubnets = new Array<string>();
  nativeSubnetSubscription: any;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder, private hs: HelpersService) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const logicalInterface = new LogicalInterface();
    logicalInterface.Name = this.form.value.name;
    logicalInterface.NativeSubnet = this.form.value.nativeSubnet;
    logicalInterface.TaggedSubnets = this.selectedSubnets;

    const dto = new LogicalInterfaceModalDto();
    dto.LogicalInterface = logicalInterface;

    this.ngx.resetModalData('logicalInterfaceModal');
    this.ngx.setModalData(this.hs.deepCopy(dto), 'logicalInterfaceModal');
    this.ngx.close('logicalInterfaceModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('logicalInterfaceModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  getData() {

    const dto =  Object.assign({}, this.ngx.getModalData('logicalInterfaceModal') as LogicalInterfaceModalDto);

    const logicalInterface = dto.LogicalInterface;

    if (logicalInterface !== undefined) {
      this.form.controls.name.setValue(logicalInterface.Name);
      this.form.controls.nativeSubnet.setValue(logicalInterface.NativeSubnet);
      this.selectedSubnets = logicalInterface.TaggedSubnets;
    }

    if (dto.Subnets) {
      this.getAvailableSubnets(dto.Subnets.map(s => s.name));
    }

    this.ngx.resetModalData('logicalInterfaceModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      nativeSubnet: ['', Validators.required],
      selectedTaggedSubnet: ['']
    });
  }

  private unsubAll() {
  }

  private reset() {
    this.unsubAll();
    this.submitted = false;
    this.buildForm();
    this.selectedSubnets = new Array<string>();
    this.availableSubnets = new Array<string>();
  }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {
    this.unsubAll();
  }

  private getAvailableSubnets(subnets: Array<string>) {
    subnets.forEach(subnet => {
      if (!this.selectedSubnets.includes(subnet)) {
        this.availableSubnets.push(subnet);
      }
    });
  }

  selectSubnet() {
    const selectSubnet = this.form.value.selectedTaggedSubnet;

    if (!selectSubnet || selectSubnet === this.form.value.nativeSubnet) {
      return;
    }

    this.selectedSubnets.push(selectSubnet);
    const availableIndex = this.availableSubnets.indexOf(selectSubnet);
    if (availableIndex > -1) {
      this.availableSubnets.splice(availableIndex, 1);
    }
    this.form.controls.selectedTaggedSubnet.setValue(null);
    this.form.controls.selectedTaggedSubnet.updateValueAndValidity();
    this.form.controls.nativeSubnet.updateValueAndValidity();
  }

  unselectSubnet(subnet) {
    this.availableSubnets.push(subnet);
    const selectedIndex = this.selectedSubnets.indexOf(subnet);
    if (selectedIndex > -1) {
      this.selectedSubnets.splice(selectedIndex, 1);
    }
  }
}
