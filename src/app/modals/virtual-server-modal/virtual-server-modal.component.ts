import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VirtualServer } from 'src/app/models/loadbalancer/virtual-server';
import { ValidateIpv4CidrAddress } from 'src/app/validators/network-form-validators';
import { VirtualServerModalDto } from 'src/app/models/virtual-server-modal-dto';
import { Pool } from 'src/app/models/loadbalancer/pool';

@Component({
  selector: 'app-virtual-server-modal',
  templateUrl: './virtual-server-modal.component.html',
  styleUrls: ['./virtual-server-modal.component.css']
})
export class VirtualServerModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  pools: Array<Pool>;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const virtualServer = new VirtualServer();
    virtualServer.Name = this.form.value.name;
    virtualServer.Type = this.form.value.type;
    virtualServer.SourceAddress = this.form.value.sourceAddress;
    virtualServer.DestinationAddress = this.form.value.destinationAddress;
    virtualServer.ServicePort = this.form.value.servicePort;
    virtualServer.Pool = this.form.value.pool;

    const dto = new VirtualServerModalDto();
    dto.VirtualServer = virtualServer;

    this.ngx.resetModalData('virtualServerModal');
    this.ngx.setModalData(Object.assign({}, dto), 'virtualServerModal');
    this.ngx.close('virtualServerModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('virtualServerModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  private setFormValidators() {
  }

  getData() {
    const dto =  Object.assign({}, this.ngx.getModalData('virtualServerModal') as VirtualServerModalDto);

    this.pools = dto.Pools;
    const virtualServer = dto.VirtualServer;

    if (virtualServer !== undefined) {
      this.form.controls.name.setValue(virtualServer.Name);
      this.form.controls.type.setValue(virtualServer.Type);
      this.form.controls.sourceAddress.setValue(virtualServer.SourceAddress);
      this.form.controls.destinationAddress.setValue(virtualServer.DestinationAddress);
      this.form.controls.servicePort.setValue(virtualServer.ServicePort);
      this.form.controls.pool.setValue(virtualServer.Pool);
      }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      sourceAddress: ['', Validators.compose([Validators.required, ValidateIpv4CidrAddress])],
      destinationAddress: ['', Validators.compose([Validators.required, ValidateIpv4CidrAddress])],
      servicePort: [0, Validators.compose([Validators.required, Validators.min(1), Validators.max(65535)])],
      pool: ['', Validators.required]
    });
  }

  private unsubAll() {
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
