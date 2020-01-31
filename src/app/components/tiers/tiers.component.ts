import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, Observable } from 'rxjs';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1TiersService, Tier, Datacenter } from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { SubnetsVlansHelpText } from 'src/app/helptext/help-text-networking';
import { TierModalDto } from 'src/app/models/network/tier-modal-dto';

@Component({
  selector: 'app-tiers',
  templateUrl: './tiers.component.html',
})
export class TiersComponent implements OnInit, OnDestroy, PendingChangesGuard {
  tiers: Tier[];

  navIndex = 0;

  tierModalSubscription: Subscription;
  currentDatacenterSubscription: Subscription;

  currentDatacenter: Datacenter;

  @HostListener('window:beforeunload')
  @HostListener('window:popstate')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.datacenterService.datacenterLockValue;
  }

  constructor(
    private ngx: NgxSmartModalService,
    public datacenterService: DatacenterContextService,
    private datacenterTierService: V1TiersService,
  ) {}

  getTiers() {
    this.datacenterTierService
      .v1DatacentersDatacenterIdTiersGet({
        datacenterId: this.currentDatacenter.id,
      })
      .subscribe(data => {
        this.tiers = data;
      });
  }

  openTierModal(modalMode: ModalMode, tier?: Tier) {
    if (modalMode === ModalMode.Edit && !tier) {
      throw new Error('Service Object required.');
    }

    const dto = new TierModalDto();

    dto.ModalMode = modalMode;
    dto.DatacenterId = this.currentDatacenter.id;

    if (modalMode === ModalMode.Edit) {
      dto.Tier = tier;
    }

    this.subscribeToTierModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'tierModal');
    this.ngx.getModal('tierModal').open();
  }

  subscribeToTierModal() {
    this.tierModalSubscription = this.ngx
      .getModal('tierModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getTiers();
        this.ngx.resetModalData('tierModal');
        this.datacenterService.unlockDatacenter();
        this.tierModalSubscription.unsubscribe();
      });
  }

  deleteTier(tier: Tier) {
    if (tier.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const deleteDescription = tier.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!tier.deletedAt) {
        this.datacenterTierService
          .v1TiersIdSoftDelete({ id: tier.id })
          .subscribe(data => {
            this.getTiers();
          });
      } else {
        this.datacenterTierService
          .v1TiersIdDelete({ id: tier.id })
          .subscribe(data => {
            this.getTiers();
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Tier?`,
        `Do you want to ${deleteDescription} tier "${tier.name}"?`,
      ),
      deleteFunction,
    );
  }

  restoreTier(tier: Tier) {
    if (tier.deletedAt) {
      this.datacenterTierService
        .v1TiersIdRestorePatch({ id: tier.id })
        .subscribe(data => {
          this.getTiers();
        });
    }
  }

  private confirmDeleteObject(
    modalDto: YesNoModalDto,
    deleteFunction: () => void,
  ) {
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (data && data.modalYes) {
          deleteFunction();
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  private getObjectName(id: string, objects: { name: string; id?: string }[]) {
    if (objects && objects.length) {
      return objects.find(o => o.id === id).name || 'N/A';
    }
  }

  importTiersConfig(event) {
    const modalDto = new YesNoModalDto(
      'Import Tiers',
      `Are you sure you would like to import ${event.length} tier${
        event.length > 1 ? 's' : ''
      }?`,
    );
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const modalData = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (modalData && modalData.modalYes) {
          let dto = event;
          dto = this.sanitizeData(event);
          this.datacenterTierService
            .v1TiersBulkPost({
              generatedTierBulkDto: { bulk: dto },
            })
            .subscribe(data => {
              this.getTiers();
            });
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  sanitizeData(entities: any) {
    return entities.map(entity => {
      this.mapCsv(entity);
      return entity;
    });
  }

  mapCsv = obj => {
    Object.entries(obj).forEach(([key, val]) => {
      if (val === 'false' || val === 'f') {
        obj[key] = false;
      }
      if (val === 'true' || val === 't') {
        obj[key] = true;
      }
      if (val === null || val === '') {
        delete obj[key];
      }
    });
    return obj;
    // tslint:disable-next-line: semicolon
  };

  private unsubAll() {
    [this.tierModalSubscription, this.currentDatacenterSubscription].forEach(
      sub => {
        try {
          if (sub) {
            sub.unsubscribe();
          }
        } catch (e) {
          console.error(e);
        }
      },
    );
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(
      cd => {
        if (cd) {
          this.currentDatacenter = cd;
          this.getTiers();
        }
      },
    );
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
