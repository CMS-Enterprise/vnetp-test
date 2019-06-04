import { Component, OnInit} from '@angular/core';
import { NgxSmartModalService} from 'ngx-smart-modal';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BareMetal } from 'src/app/models/bare-metal/bare-metal';

@Component({
  selector: 'app-bare-metal-modal',
  templateUrl: './bare-metal-modal.component.html',
  styleUrls: ['./bare-metal-modal.component.css']
})
export class BareMetalModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;


  osList: Array<string>;
  hypervisorList: Array<string>;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const bareMetal = new BareMetal();
    bareMetal.Name = this.form.value.name;
    bareMetal.HardwarePlatform = this.form.value.hardwarePlatform;
    bareMetal.vCpuCount = this.form.value.vCpuCount;
    bareMetal.RamCount = this.form.value.ramCount;
    bareMetal.NicCount = this.form.value.nicCount;
    bareMetal.LocalStorage = this.form.value.localStorage;
    bareMetal.SanStorage = this.form.value.sanStorage;
    bareMetal.OS = this.form.value.os;
    bareMetal.Hypervisor = this.form.value.hypervisor;

    this.ngx.resetModalData('bareMetalModal');
    this.ngx.setModalData(Object.assign({}, bareMetal), 'bareMetalModal');
    this.ngx.close('bareMetalModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('bareMetalModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  getData() {
    const bareMetal =  Object.assign({}, this.ngx.getModalData('bareMetalModal') as BareMetal);
    if (bareMetal !== undefined) {
      this.form.controls.name.setValue(bareMetal.Name);
      this.form.controls.hardwarePlatform.setValue(bareMetal.HardwarePlatform);
      this.form.controls.vCpuCount.setValue(bareMetal.vCpuCount);
      this.form.controls.ramCount.setValue(bareMetal.RamCount);
      this.form.controls.nicCount.setValue(bareMetal.NicCount);
      this.form.controls.localStorage.setValue(bareMetal.LocalStorage);
      this.form.controls.sanStorage.setValue(bareMetal.SanStorage);
      this.form.controls.os.setValue(bareMetal.OS);
      this.form.controls.hypervisor.setValue(bareMetal.Hypervisor);
      }
    this.ngx.resetModalData('bareMetalModal');
  }

  // TODO: Confirm min/max on interval and timeout.
  private buildForm() {
    this.form = this.formBuilder.group({
      name: [''],
      hardwarePlatform: [''],
      vCpuCount: [''],
      ramCount: [''],
      nicCount: [''],
      localStorage: [''],
      sanStorage: [''],
      os: [''],
      hypervisor: ['']
    });
  }

  private reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
    this.osList = ['RedHat', 'Solaris', 'Windows'];
    this.hypervisorList = ['VMware', 'KVM', 'Oracle', 'RHEV'];
  }
}
