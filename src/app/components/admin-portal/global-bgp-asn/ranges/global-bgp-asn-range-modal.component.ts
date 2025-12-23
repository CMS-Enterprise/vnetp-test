import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  V3GlobalEnvironmentsService,
  V3GlobalBgpRangesService,
  CreateGlobalBgpRangeDto,
  UpdateGlobalBgpRangeDto,
  GlobalBgpAsnRange,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import AsnUtil from 'src/app/utils/AsnUtil';

@Component({
  selector: 'app-global-bgp-asn-range-modal',
  templateUrl: './global-bgp-asn-range-modal.component.html',
})
export class GlobalBgpAsnRangeModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  environments: { id: string; name: string }[] = [];
  mode: ModalMode = ModalMode.Create;
  editingRange: GlobalBgpAsnRange | null = null;
  displayFormat: 'asplain' | 'asdot' = 'asplain';
  private startAutoSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private envService: V3GlobalEnvironmentsService,
    private bgpService: V3GlobalBgpRangesService,
    public ngx: NgxSmartModalService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.envService.getManyEnvironments().subscribe(envs => {
      this.environments = (envs || []).map(e => ({ id: e.id as any, name: e.name as any }));
    });
  }

  ngOnDestroy(): void {
    this.startAutoSub?.unsubscribe();
  }

  getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('globalBgpAsnRangeModal') as any);
    this.mode = dto?.ModalMode ?? ModalMode.Create;
    if (this.mode === ModalMode.Edit && dto?.range) {
      this.editingRange = dto.range;
      const startAsNumber = typeof dto.range.start === 'string' ? parseInt(dto.range.start, 10) : dto.range.start;
      const endAsNumber = typeof dto.range.end === 'string' ? parseInt(dto.range.end, 10) : dto.range.end;
      this.form.patchValue({
        name: dto.range.name,
        environmentId: dto.range.environmentId,
        startAsPlain: startAsNumber,
        endAsPlain: endAsNumber,
        startAsDot: AsnUtil.asPlainToAsdot(startAsNumber),
        endAsDot: AsnUtil.asPlainToAsdot(endAsNumber),
        description: dto.range.description || '',
      });
      this.form.get('environmentId')?.disable();
      this.form.get('name')?.disable();
    } else {
      this.reset();
    }
    this.ngx.resetModalData('globalBgpAsnRangeModal');
  }

  reset(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [null, Validators.required],
      environmentId: [null, Validators.required],
      startAsPlain: [null, AsnUtil.asPlainValidator()],
      endAsPlain: [null, AsnUtil.asPlainValidator()],
      startAsDot: ['', AsnUtil.asdotValidator()],
      endAsDot: ['', AsnUtil.asdotValidator()],
      description: [''],
    });
    this.editingRange = null;
    this.mode = ModalMode.Create;
    this.displayFormat = 'asplain';
    this.updateValidators();
    this.setupStartEndAutoFill();
  }

  private updateValidators(): void {
    const startAsPlainCtrl = this.form.get('startAsPlain');
    const endAsPlainCtrl = this.form.get('endAsPlain');
    const startAsDotCtrl = this.form.get('startAsDot');
    const endAsDotCtrl = this.form.get('endAsDot');

    if (this.displayFormat === 'asplain') {
      startAsPlainCtrl?.setValidators([Validators.required, AsnUtil.asPlainValidator()]);
      endAsPlainCtrl?.setValidators([Validators.required, AsnUtil.asPlainValidator()]);
      startAsDotCtrl?.clearValidators();
      endAsDotCtrl?.clearValidators();
    } else {
      startAsPlainCtrl?.clearValidators();
      endAsPlainCtrl?.clearValidators();
      startAsDotCtrl?.setValidators([Validators.required, AsnUtil.asdotValidator()]);
      endAsDotCtrl?.setValidators([Validators.required, AsnUtil.asdotValidator()]);
    }

    startAsPlainCtrl?.updateValueAndValidity({ emitEvent: false });
    endAsPlainCtrl?.updateValueAndValidity({ emitEvent: false });
    startAsDotCtrl?.updateValueAndValidity({ emitEvent: false });
    endAsDotCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  private setupStartEndAutoFill(): void {
    this.startAutoSub?.unsubscribe();
    const startAsPlainCtrl = this.form.get('startAsPlain');
    const endAsPlainCtrl = this.form.get('endAsPlain');
    const startAsDotCtrl = this.form.get('startAsDot');
    const endAsDotCtrl = this.form.get('endAsDot');

    if (!startAsPlainCtrl || !endAsPlainCtrl || !startAsDotCtrl || !endAsDotCtrl) {
      return;
    }

    const startCtrl = this.displayFormat === 'asplain' ? startAsPlainCtrl : startAsDotCtrl;
    const endCtrl = this.displayFormat === 'asplain' ? endAsPlainCtrl : endAsDotCtrl;

    this.startAutoSub = startCtrl.valueChanges.subscribe((startVal: number | string) => {
      if (this.mode !== ModalMode.Create) {
        return;
      }
      if (endCtrl.dirty) {
        return;
      }
      if (startVal === null || startVal === undefined || startVal === '') {
        return;
      }

      let startAsPlain: number;
      if (this.displayFormat === 'asplain') {
        startAsPlain = Number(startVal);
        if (isNaN(startAsPlain)) {
          return;
        }
      } else {
        const parsed = AsnUtil.parseAsnInput(startVal as string);
        if (parsed === null) {
          return;
        }
        startAsPlain = parsed;
      }

      const MAX_PRIVATE_4B = 4294967294;
      const suggested = Math.min(startAsPlain + 100, MAX_PRIVATE_4B);

      endAsPlainCtrl.setValue(suggested, { emitEvent: false, onlySelf: true });
      endAsDotCtrl.setValue(AsnUtil.asPlainToAsdot(suggested), { emitEvent: false, onlySelf: true });
    });
  }

  get startAsPlainCtrl() {
    return this.form.get('startAsPlain');
  }
  get endAsPlainCtrl() {
    return this.form.get('endAsPlain');
  }
  get startAsDotCtrl() {
    return this.form.get('startAsDot');
  }
  get endAsDotCtrl() {
    return this.form.get('endAsDot');
  }

  isFormInvalid(): boolean {
    if (this.form.get('name')?.invalid || this.form.get('environmentId')?.invalid) {
      return true;
    }

    if (this.displayFormat === 'asplain') {
      return !!(this.form.get('startAsPlain')?.invalid || this.form.get('endAsPlain')?.invalid);
    } else {
      return !!(this.form.get('startAsDot')?.invalid || this.form.get('endAsDot')?.invalid);
    }
  }

  onFormatChange(): void {
    if (this.displayFormat === 'asplain') {
      const startAsDotValue = this.form.get('startAsDot')?.value;
      const endAsDotValue = this.form.get('endAsDot')?.value;
      if (startAsDotValue) {
        const startParsed = AsnUtil.parseAsnInput(startAsDotValue);
        if (startParsed !== null) {
          this.form.get('startAsPlain')?.setValue(startParsed);
        }
      }
      if (endAsDotValue) {
        const endParsed = AsnUtil.parseAsnInput(endAsDotValue);
        if (endParsed !== null) {
          this.form.get('endAsPlain')?.setValue(endParsed);
        }
      }
    } else {
      const startAsPlainValue = this.form.get('startAsPlain')?.value;
      const endAsPlainValue = this.form.get('endAsPlain')?.value;
      if (startAsPlainValue !== null && startAsPlainValue !== undefined) {
        this.form.get('startAsDot')?.setValue(AsnUtil.asPlainToAsdot(startAsPlainValue));
      }
      if (endAsPlainValue !== null && endAsPlainValue !== undefined) {
        this.form.get('endAsDot')?.setValue(AsnUtil.asPlainToAsdot(endAsPlainValue));
      }
    }
    this.updateValidators();
    this.setupStartEndAutoFill();
  }

  save(): void {
    if (this.displayFormat === 'asplain') {
      this.form.get('startAsPlain')?.markAsTouched();
      this.form.get('endAsPlain')?.markAsTouched();
    } else {
      this.form.get('startAsDot')?.markAsTouched();
      this.form.get('endAsDot')?.markAsTouched();
    }
    this.form.get('name')?.markAsTouched();
    this.form.get('environmentId')?.markAsTouched();

    if (this.isFormInvalid()) {
      return;
    }

    let startValue: number;
    let endValue: number;

    if (this.displayFormat === 'asplain') {
      startValue = this.form.get('startAsPlain')?.value;
      endValue = this.form.get('endAsPlain')?.value;
    } else {
      const startParsed = AsnUtil.parseAsnInput(this.form.get('startAsDot')?.value);
      const endParsed = AsnUtil.parseAsnInput(this.form.get('endAsDot')?.value);
      if (startParsed === null || endParsed === null) {
        return;
      }
      startValue = startParsed;
      endValue = endParsed;
    }

    if (startValue > endValue) {
      const endCtrl = this.displayFormat === 'asplain' ? this.form.get('endAsPlain') : this.form.get('endAsDot');
      endCtrl?.setErrors({ minRange: true });
      endCtrl?.markAsTouched();
      return;
    }

    if (this.mode === ModalMode.Create) {
      const dto: CreateGlobalBgpRangeDto = {
        name: this.form.value.name,
        environmentId: this.form.value.environmentId,
        start: startValue.toString(),
        end: endValue.toString(),
        description: this.form.value.description || undefined,
      };
      this.bgpService.createGlobalBgpAsn({ createGlobalBgpRangeDto: dto }).subscribe(() => this.close());
      return;
    }

    const updateDto: UpdateGlobalBgpRangeDto = {
      description: this.form.getRawValue().description || undefined,
      start: startValue.toString(),
      end: endValue.toString(),
    };
    const id = this.editingRange?.id;
    if (id) {
      this.bgpService.updateGlobalBgpAsn({ id, updateGlobalBgpRangeDto: updateDto }).subscribe(() => this.close());
    } else {
      this.close();
    }
  }

  close(): void {
    this.ngx.close('globalBgpAsnRangeModal');
  }
}

