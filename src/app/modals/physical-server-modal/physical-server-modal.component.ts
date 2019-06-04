import { Component, OnInit} from '@angular/core';
import { NgxSmartModalService} from 'ngx-smart-modal';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PhysicalServer } from 'src/app/models/physical-server/physical-server';

@Component({
  selector: 'app-physical-server-modal',
  templateUrl: './physical-server-modal.component.html',
  styleUrls: ['./physical-server-modal.component.css']
})
export class PhysicalServerModalComponent implements OnInit {
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

    const physicalServer = new PhysicalServer();
    physicalServer.Name = this.form.value.name;
    physicalServer.HardwarePlatform = this.form.value.hardwarePlatform;
    physicalServer.CpuCount = this.form.value.cpuCount;
    physicalServer.RamCount = this.form.value.ramCount;
    physicalServer.NicCount = this.form.value.nicCount;
    physicalServer.LocalStorage = this.form.value.localStorage;
    physicalServer.SanStorage = this.form.value.sanStorage;
    physicalServer.OS = this.form.value.os;

    this.ngx.resetModalData('physicalServerModal');
    this.ngx.setModalData(Object.assign({}, physicalServer), 'physicalServerModal');
    this.ngx.close('physicalServerModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('physicalServerModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  getData() {
    const physicalServer =  Object.assign({}, this.ngx.getModalData('physicalServerModal') as PhysicalServer);
    if (physicalServer !== undefined) {
      this.form.controls.name.setValue(physicalServer.Name);
      this.form.controls.hardwarePlatform.setValue(physicalServer.HardwarePlatform);
      this.form.controls.cpuCount.setValue(physicalServer.CpuCount);
      this.form.controls.ramCount.setValue(physicalServer.RamCount);
      this.form.controls.nicCount.setValue(physicalServer.NicCount);
      this.form.controls.localStorage.setValue(physicalServer.LocalStorage);
      this.form.controls.sanStorage.setValue(physicalServer.SanStorage);
      this.form.controls.os.setValue(physicalServer.OS);
      }
    this.ngx.resetModalData('physicalServerModal');
  }

  // TODO: Confirm min/max on interval and timeout.
  private buildForm() {
    this.form = this.formBuilder.group({
      name: [''],
      hardwarePlatform: [''],
      cpuCount: [''],
      ramCount: [''],
      nicCount: [''],
      localStorage: [''],
      sanStorage: [''],
      os: [''],
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
