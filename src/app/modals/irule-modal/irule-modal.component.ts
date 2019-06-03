import { Component, OnInit} from '@angular/core';
import { NgxSmartModalService} from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IRule } from 'src/app/models/loadbalancer/irule';

@Component({
  selector: 'app-irule-modal',
  templateUrl: './irule-modal.component.html',
  styleUrls: ['./irule-modal.component.css']
})
export class IRuleModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const irule = new IRule();
    irule.Name = this.form.value.name;
    irule.Content = this.form.value.content;

    this.ngx.resetModalData('iruleModal');
    this.ngx.setModalData(Object.assign({}, irule), 'iruleModal');
    this.ngx.close('iruleModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('iruleModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  getData() {
    const irule =  Object.assign({}, this.ngx.getModalData('iruleModal') as IRule);
    if (irule !== undefined) {
      this.form.controls.name.setValue(irule.Name);
      this.form.controls.content.setValue(irule.Content);
      }
    this.ngx.resetModalData('iruleModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  private reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
