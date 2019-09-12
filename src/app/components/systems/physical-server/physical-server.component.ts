import { Component, OnInit, OnDestroy } from '@angular/core';
import { PhysicalServer } from 'src/app/models/physical-server/physical-server';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { HelpersService } from 'src/app/services/helpers.service';

@Component({
  selector: 'app-physical-server',
  templateUrl: './physical-server.component.html'
})
export class PhysicalServerComponent implements OnInit, OnDestroy {

  physicalServers: Array<PhysicalServer>;
  deletedPhysicalServers: Array<PhysicalServer>;

  editPhysicalServerIndex: number;

  physicalServerModalMode: ModalMode;
  dirty: boolean;

  physicalServerModalSubscription: Subscription;

  constructor(private ngxSmartModalService: NgxSmartModalService, private helperService: HelpersService) {
   }

   createPhysicalServer() {
     this.subscribeToPhysicalServerModal();
     this.physicalServerModalMode = ModalMode.Create;
     this.ngxSmartModalService.getModal('physicalServerModal').open();
   }

   editPhysicalServer(physicalServer: PhysicalServer) {
     this.subscribeToPhysicalServerModal();
     this.physicalServerModalMode = ModalMode.Edit;
     this.ngxSmartModalService.setModalData(this.helperService.deepCopy(physicalServer), 'physicalServerModal');
     this.editPhysicalServerIndex = this.physicalServers.indexOf(physicalServer);
     this.ngxSmartModalService.getModal('physicalServerModal').open();
   }

   subscribeToPhysicalServerModal() {
    this.physicalServerModalSubscription =
    this.ngxSmartModalService.getModal('physicalServerModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as PhysicalServer;

      if (data !== undefined) {
        this.savePhysicalServer(data);
      }
      this.ngxSmartModalService.resetModalData('physicalServerModal');
      this.physicalServerModalSubscription.unsubscribe();
    });
  }

  savePhysicalServer(physicalServer: PhysicalServer) {
    if (this.physicalServerModalMode === ModalMode.Create) {
      this.physicalServers.push(physicalServer);
    } else {
      this.physicalServers[this.editPhysicalServerIndex] = physicalServer;
    }
    this.dirty = true;
  }

  deletePhysicalServer(physicalServer: PhysicalServer) {
    const index = this.physicalServers.indexOf(physicalServer);
    if (index > -1) {
      this.physicalServers.splice(index, 1);

      if (!this.deletedPhysicalServers) { this.deletedPhysicalServers = new Array<PhysicalServer>(); }
      this.deletedPhysicalServers.push(physicalServer);

      this.dirty = true;
    }
  }

  saveAll() {
    throw new Error('Not Implemented');
  }

  private unsubAll() {
    [this.physicalServerModalSubscription]
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
    this.physicalServers = new Array<PhysicalServer>();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
