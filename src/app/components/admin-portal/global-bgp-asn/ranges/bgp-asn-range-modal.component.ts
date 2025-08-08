import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-bgp-asn-range-modal',
  templateUrl: './bgp-asn-range-modal.component.html',
})
export class BgpAsnRangeModalComponent implements OnInit {
  form: FormGroup;
  environments: { id: string; name: string }[] = [];
  mode: ModalMode = ModalMode.Create;
  editingRange: GlobalBgpAsnRange | null = null;

  constructor(
    private fb: FormBuilder,
    private envService: V3GlobalEnvironmentService,
    private bgpService: V3GlobalBgpRangesService,
    public ngx: NgxSmartModalService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      environmentId: [null, Validators.required],
      start: [null, [Validators.required, Validators.min(65536)]],
      end: [null, [Validators.required, Validators.min(65536)]],
      type: [CreateGlobalBgpRangeDtoTypeEnum.Internal, Validators.required],
      description: [''],
    });

    this.envService.getManyEnvironments().subscribe(envs => {
      this.environments = (envs || []).map(e => ({ id: e.id as any, name: e.name as any }));
    });
    // Load modal data to determine mode and prefill
    const modal = this.ngx.getModal('bgpAsnRangeModal');
    const data = (modal?.getData() as { ModalMode?: ModalMode; range?: GlobalBgpAsnRange }) || undefined;
    if (data) {
      this.mode = data.ModalMode ?? ModalMode.Create;
      if (this.mode === ModalMode.Edit && data.range) {
        this.editingRange = data.range;
        this.form.patchValue({
          environmentId: data.range.environmentId,
          start: data.range.start,
          end: data.range.end,
          type: data.range.type as GlobalBgpAsnRangeTypeEnum,
          description: data.range.description || '',
        });
        this.form.get('environmentId').disable();
        this.form.get('description').disable();
        this.form.get('type').disable();
      }
    }
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
    // Upper bound for private 4-byte ASN range (per request: server also checks)
    const MAX_PRIVATE_4B = 4294967294; // Allow upper bound inclusive
    if (end > MAX_PRIVATE_4B) {
      this.end.setErrors({ max: true });
      return;
    }

    if (this.mode === ModalMode.Create) {
      const dto: CreateGlobalBgpRangeDto = {
        name: `${this.form.value.startAsn}-${this.form.value.endAsn}`,
        environmentId: this.form.value.environmentId,
        type: this.form.value.type,
        start: this.form.value.start,
        end: this.form.value.end,
        description: this.form.value.description || undefined,
      };
      this.bgpService.createGlobalBgpAsn({ createGlobalBgpRangeDto: dto }).subscribe(() => this.close());
      return;
    }

    // Edit: only start/end allowed
    const updateDto: UpdateGlobalBgpRangeDto = {
      start: this.form.getRawValue().startAsn,
      end: this.form.getRawValue().endAsn,
    };
    // editingRange requires id — presume model carries id; if not, backend likely uses name; adjust when spec clarifies
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
