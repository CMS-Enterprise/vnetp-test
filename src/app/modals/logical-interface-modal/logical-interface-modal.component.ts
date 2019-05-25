import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LogicalInterfaceModalDto } from 'src/app/models/logical-interface-modal-dto';
import { LogicalInterface } from 'src/app/models/network/logical-interface';
import { HelpersService } from 'src/app/services/helpers.service';

@Component({
  selector: 'app-logical-interface-modal',
  templateUrl: './logical-interface-modal.component.html',
  styleUrls: ['./logical-interface-modal.component.css']
})
export class LogicalInterfaceModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;

  selectedPhysicalInterfaces = new Array<string>();
  availablePhysicalInterfaces = new Array<string>();

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
    logicalInterface.PhysicalInterfaces = this.selectedPhysicalInterfaces;

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
      this.selectedPhysicalInterfaces = logicalInterface.PhysicalInterfaces;
      this.selectedSubnets = logicalInterface.TaggedSubnets;
    }

    if (dto.PhysicalInterfaces) {
      this.getAvailablePhysicalInterfaces(dto.PhysicalInterfaces.map(h => h.Name));
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
      selectedTaggedSubnet: [''],
      selectedPhysicalInterface: ['']
    });
  }

  private unsubAll() {
  }

  private reset() {
    this.unsubAll();
    this.submitted = false;
    this.buildForm();
    this.selectedPhysicalInterfaces = new Array<string>();
    this.availablePhysicalInterfaces = new Array<string>();
    this.selectedSubnets = new Array<string>();
    this.availableSubnets = new Array<string>();
  }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {
    this.unsubAll();
  }

  private getAvailablePhysicalInterfaces(physicalInterfaces: Array<string>) {
    physicalInterfaces.forEach( physicalInterface => {
      if (!this.selectedPhysicalInterfaces.includes(physicalInterface)) {
        this.availablePhysicalInterfaces.push(physicalInterface);
      }
    });
  }

  private getAvailableSubnets(subnets: Array<string>) {
    subnets.forEach(subnet => {
      if (!this.selectedSubnets.includes(subnet)) {
        this.availableSubnets.push(subnet);
      }
    });
  }

  selectPhysicalInterface() {
    const selectPhysicalInterface = this.form.value.selectedPhysicalInterface;

    if (!selectPhysicalInterface) {
      return;
    }

    this.selectedPhysicalInterfaces.push(selectPhysicalInterface);
    const availableIndex = this.availablePhysicalInterfaces.indexOf(selectPhysicalInterface);
    if (availableIndex > -1) {
      this.availablePhysicalInterfaces.splice(availableIndex, 1);
    }
    this.form.controls.selectedPhysicalInterface.setValue(null);
    this.form.controls.selectedPhysicalInterface.updateValueAndValidity();
  }

  unselectPhysicalInterface(physicalInterface) {
    this.availablePhysicalInterfaces.push(physicalInterface);
    const selectedIndex = this.selectedPhysicalInterfaces.indexOf(physicalInterface);
    if (selectedIndex > -1) {
      this.selectedPhysicalInterfaces.splice(selectedIndex, 1);
    }
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


