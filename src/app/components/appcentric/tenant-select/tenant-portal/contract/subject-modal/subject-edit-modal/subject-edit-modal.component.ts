import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, V2AppCentricSubjectsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-subject-edit-modal',
  templateUrl: './subject-edit-modal.component.html',
  styleUrls: ['./subject-edit-modal.component.css'],
})
export class SubjectEditModalComponent implements OnInit {
  public subjectId: string;
  public form: FormGroup;
  public submitted: boolean;

  constructor(private formBuilder: FormBuilder, private ngx: NgxSmartModalService, private subjectService: V2AppCentricSubjectsService) {}

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('subjectEditModal');
    this.reset();
  }

  public getData(): void {
    const subject = Object.assign({}, this.ngx.getModalData('subjectEditModal') as Subject);

    this.subjectId = subject.id;

    if (subject !== undefined) {
      this.form.controls.name.setValue(subject.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(subject.description);
      this.form.controls.alias.setValue(subject.alias);
      this.form.controls.applyBothDirections.setValue(subject.applyBothDirections);
      this.form.controls.reverseFilterPorts.setValue(subject.reverseFilterPorts);
      this.form.controls.globalAlias.setValue(subject.globalAlias);
    }
    this.ngx.resetModalData('subjectEditModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('subjectEditModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      applyBothDirections: [null],
      reverseFilterPorts: [null],
      globalAlias: ['', Validators.compose([Validators.maxLength(100)])],
    });
  }

  private editSubject(subject: Subject): void {
    subject.name = null;
    subject.tenantId = null;
    this.subjectService
      .updateSubject({
        uuid: this.subjectId,
        subject,
      })
      .subscribe(
        () => {},
        () => {},
        () => this.closeModal(),
      );
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description, alias, reverseFilterPorts, applyBothDirections, globalAlias } = this.form.value;
    const subject = {
      name,
      description,
      alias,
      reverseFilterPorts,
      applyBothDirections,
      globalAlias,
    } as Subject;

    this.editSubject(subject);
  }
}
