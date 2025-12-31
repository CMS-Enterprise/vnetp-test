import { Component, Input } from '@angular/core';
import { Vrf } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { VrfModalHelpText } from 'src/app/helptext/help-text-networking';
import { VrfModalDto } from 'src/app/models/appcentric/vrf-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import AsnUtil from 'src/app/utils/AsnUtil';

@Component({
  selector: 'app-vrf-modal',
  templateUrl: './vrf-modal.component.html',
  styleUrls: ['./vrf-modal.component.css'],
})
export class VrfModalComponent {
  public modalMode: ModalMode;
  public vrfId: string;
  @Input() public tenantId: string;

  public currentVrf: Vrf | null = null;

  public helpText: VrfModalHelpText;
  public AsnUtil = AsnUtil;

  constructor(private ngx: NgxSmartModalService, helpText: VrfModalHelpText) {
    this.helpText = helpText;
  }

  public closeModal(): void {
    this.ngx.close('vrfModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('vrfModal') as VrfModalDto);

    this.modalMode = dto.ModalMode;
    if (this.modalMode === ModalMode.Edit) {
      this.vrfId = dto?.vrf?.id;
      this.currentVrf = dto?.vrf;
    }

    this.ngx.resetModalData('vrfModal');
  }

  public reset(): void {
    this.currentVrf = null;
    this.ngx.resetModalData('vrfModal');
  }

}
