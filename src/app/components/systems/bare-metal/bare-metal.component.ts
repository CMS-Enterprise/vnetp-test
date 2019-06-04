import { Component, OnInit, OnDestroy } from '@angular/core';
import { BareMetal } from 'src/app/models/bare-metal/bare-metal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { HelpersService } from 'src/app/services/helpers.service';

@Component({
  selector: 'app-bare-metal',
  templateUrl: './bare-metal.component.html',
  styleUrls: ['./bare-metal.component.css']
})
export class BareMetalComponent implements OnInit, OnDestroy {

  bareMetals: Array<BareMetal>;
  deletedBareMetals: Array<BareMetal>;

  editBareMetalIndex: number;

  bareMetalModalMode: ModalMode;
  dirty: boolean;

  bareMetalModalSubscription: Subscription;

  constructor(private ngxSmartModalService: NgxSmartModalService, private helperService: HelpersService) {
   }

   createBareMetal() {
     this.subscribeToBareMetalModal();
     this.bareMetalModalMode = ModalMode.Create;
     this.ngxSmartModalService.getModal('bareMetalModal').open();
   }

   editBareMetal(bareMetal: BareMetal) {
     this.subscribeToBareMetalModal();
     this.bareMetalModalMode = ModalMode.Edit;
     this.ngxSmartModalService.setModalData(this.helperService.deepCopy(bareMetal), 'bareMetalModal');
     this.editBareMetalIndex = this.bareMetals.indexOf(bareMetal);
     this.ngxSmartModalService.getModal('bareMetalModal').open();
   }

   subscribeToBareMetalModal() {
    this.bareMetalModalSubscription =
    this.ngxSmartModalService.getModal('bareMetalModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as BareMetal;

      if (data !== undefined) {
        this.saveBareMetal(data);
      }
      this.ngxSmartModalService.resetModalData('bareMetalModal');
      this.bareMetalModalSubscription.unsubscribe();
    });
  }

  saveBareMetal(bareMetal: BareMetal) {
    if (this.bareMetalModalMode === ModalMode.Create) {
      this.bareMetals.push(bareMetal);
    } else {
      this.bareMetals[this.editBareMetalIndex] = bareMetal;
    }
    this.dirty = true;
  }

  deleteBareMetal(bareMetal: BareMetal) {
    const index = this.bareMetals.indexOf(bareMetal);
    if (index > -1) {
      this.bareMetals.splice(index, 1);

      if (!this.deletedBareMetals) { this.deletedBareMetals = new Array<BareMetal>(); }
      this.deletedBareMetals.push(bareMetal);

      this.dirty = true;
    }
  }

  saveAll() {
    throw new Error('Not Implemented');
  }

  private unsubAll() {
    [this.bareMetalModalSubscription]
    .forEach(sub => {
      try {
        if (sub) {
          sub.unsubscribe();
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  ngOnInit() {
    this.bareMetals = new Array<BareMetal>();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
