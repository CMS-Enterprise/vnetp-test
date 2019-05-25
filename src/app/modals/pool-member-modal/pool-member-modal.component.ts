import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PoolMember } from 'src/app/models/loadbalancer/pool-member';
import { ValidateIpv4Any, ValidateIpv4Address } from 'src/app/validators/network-form-validators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pool-member-modal',
  templateUrl: './pool-member-modal.component.html',
  styleUrls: ['./pool-member-modal.component.css']
})
export class PoolMemberModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  typeSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const poolMember = new PoolMember();
    poolMember.Name = this.form.value.name;
    poolMember.Type = this.form.value.type;
    poolMember.IpAddress = this.form.value.ipAddress;
    poolMember.Fqdn = this.form.value.fqdn;
    poolMember.AutoPopulate = this.form.value.autoPopulate;
    poolMember.ServicePort = this.form.value.servicePort;
    poolMember.Priority = this.form.value.priority;

    this.ngx.resetModalData('poolMemberModal');
    this.ngx.setModalData(Object.assign({}, poolMember), 'poolMemberModal');
    this.ngx.close('poolMemberModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('poolMemberModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  private setFormValidators() {
    const fqdn = this.form.get('fqdn');
    const autoPopulate = this.form.get('autoPopulate');
    const ipAddress = this.form.get('ipAddress');

    this.typeSubscription = this.form.get('type').valueChanges
    .subscribe( type => {

      if (type === 'ipaddress') {
        ipAddress.setValidators(Validators.compose([Validators.required, ValidateIpv4Address]));
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
    const poolMember =  Object.assign({}, this.ngx.getModalData('poolMemberModal') as PoolMember);
    if (poolMember !== undefined) {
      this.form.controls.name.setValue(poolMember.Name);
      this.form.controls.type.setValue(poolMember.Type);
      this.form.controls.ipAddress.setValue(poolMember.IpAddress);
      this.form.controls.fqdn.setValue(poolMember.Fqdn);
      this.form.controls.autoPopulate.setValue(poolMember.AutoPopulate);
      this.form.controls.servicePort.setValue(poolMember.ServicePort);
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
      servicePort: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(65535)])],
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
