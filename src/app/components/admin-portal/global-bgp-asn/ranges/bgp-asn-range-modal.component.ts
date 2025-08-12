import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  V3GlobalEnvironmentService,
  V3GlobalBgpRangesService,
  CreateGlobalBgpRangeDto,
  UpdateGlobalBgpRangeDto,
  CreateGlobalBgpRangeDtoTypeEnum,
  GlobalBgpAsnRange,
  GlobalBgpAsnRangeTypeEnum,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bgp-asn-range-modal',
  templateUrl: './bgp-asn-range-modal.component.html',
})
export class BgpAsnRangeModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  environments: { id: string; name: string }[] = [];
  mode: ModalMode = ModalMode.Create;
  editingRange: GlobalBgpAsnRange | null = null;
  private startAutoSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private envService: V3GlobalEnvironmentService,
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
    console.log('getData');
    const dto = Object.assign({}, this.ngx.getModalData('bgpAsnRangeModal') as any);
    this.mode = dto?.ModalMode ?? ModalMode.Create;
    if (this.mode === ModalMode.Edit && dto?.range) {
      this.editingRange = dto.range;
      this.form.patchValue({
        name: dto.range.name,
        environmentId: dto.range.environmentId,
        start: dto.range.start,
        end: dto.range.end,
        type: dto.range.type as GlobalBgpAsnRangeTypeEnum,
        description: dto.range.description || '',
      });
      this.form.get('environmentId')?.disable();
      this.form.get('name')?.disable();
      this.form.get('type')?.disable();
    } else {
      this.reset();
    }
    this.ngx.resetModalData('bgpAsnRangeModal');
  }

  reset(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [null, Validators.required],
      environmentId: [null, Validators.required],
      start: [null, [Validators.required, Validators.min(65536), Validators.max(4294967294)]],
      end: [null, [Validators.required, Validators.min(65536), Validators.max(4294967294)]],
      type: [CreateGlobalBgpRangeDtoTypeEnum.Internal, Validators.required],
      description: [''],
    });
    this.editingRange = null;
    this.mode = ModalMode.Create;
    this.setupStartEndAutoFill();
  }

  private setupStartEndAutoFill(): void {
    this.startAutoSub?.unsubscribe();
    const startCtrl = this.form.get('start');
    const endCtrl = this.form.get('end');
    if (!startCtrl || !endCtrl) {
      return;
    }
    this.startAutoSub = startCtrl.valueChanges.subscribe((startVal: number) => {
      if (this.mode !== ModalMode.Create) {
        return;
      }
      if (endCtrl.dirty) {
        return;
      }
      const numericStart = Number(startVal);
      if (Number.isNaN(numericStart)) {
        return;
      }
      const MAX_PRIVATE_4B = 4294967294;
      const suggested = Math.min(numericStart + 100, MAX_PRIVATE_4B);
      endCtrl.setValue(suggested, { emitEvent: false, onlySelf: true });
    });
  }

  get start() {
    return this.form.get('start');
  }
  get end() {
    return this.form.get('end');
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const start = this.start.value;
    const end = this.end.value;
    if (start > end) {
      this.end.setErrors({ minRange: true });
      return;
    }

    if (this.mode === ModalMode.Create) {
      const dto: CreateGlobalBgpRangeDto = {
        name: this.form.value.name,
        environmentId: this.form.value.environmentId,
        type: this.form.value.type,
        start: this.form.value.start,
        end: this.form.value.end,
        description: this.form.value.description || undefined,
      };
      this.bgpService.createGlobalBgpAsn({ createGlobalBgpRangeDto: dto }).subscribe(() => this.close());
      return;
    }

    const updateDto: UpdateGlobalBgpRangeDto = {
      description: this.form.getRawValue().description || undefined,
      start: this.form.getRawValue().start,
      end: this.form.getRawValue().end,
    };
    const id = (this.editingRange as any)?.id;
    if (id) {
      this.bgpService.updateGlobalBgpAsn({ id, updateGlobalBgpRangeDto: updateDto }).subscribe(() => this.close());
    } else {
      this.close();
    }
  }

  close(): void {
    this.ngx.close('bgpAsnRangeModal');
  }
}
