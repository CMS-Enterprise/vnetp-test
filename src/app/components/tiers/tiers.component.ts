import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1TiersService, Tier, Datacenter, V1TierGroupsService, TierGroup } from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TierModalDto } from 'src/app/models/network/tier-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import ObjectUtil from 'src/app/utils/ObjectUtil';

@Component({
  selector: 'app-tiers',
  templateUrl: './tiers.component.html',
})
export class TiersComponent implements OnInit, OnDestroy {
  tiers: Tier[];
  tierGroups: TierGroup[];

  perPage = 20;
  currentTiersPage = 1;
  ModalMode = ModalMode;

  tierModalSubscription: Subscription;
  currentDatacenterSubscription: Subscription;

  currentDatacenter: Datacenter;

  constructor(
    private ngx: NgxSmartModalService,
    public datacenterService: DatacenterContextService,
    private datacenterTierService: V1TiersService,
    private tierGroupService: V1TierGroupsService,
  ) {}

  getTierGroups(getTiers = false) {
    this.tierGroupService
      .v1TierGroupsGet({
        filter: `datacenterId||eq||${this.currentDatacenter.id}`,
      })
      .subscribe(data => {
        this.tierGroups = data;

        if (getTiers) {
          this.getTiers();
        }
      });
  }

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
      throw new Error('Tier required');
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
    this.tierModalSubscription = this.ngx.getModal('tierModal').onCloseFinished.subscribe(() => {
      this.getTiers();
      this.ngx.resetModalData('tierModal');
      this.datacenterService.unlockDatacenter();
      this.tierModalSubscription.unsubscribe();
    });
  }

  public deleteTier(tier: Tier): void {
    if (tier.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const deleteDescription = tier.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!tier.deletedAt) {
        this.datacenterTierService.v1TiersIdSoftDelete({ id: tier.id }).subscribe(data => {
          this.getTiers();
        });
      } else {
        this.datacenterTierService.v1TiersIdDelete({ id: tier.id }).subscribe(data => {
          this.getTiers();
        });
      }
    };

    SubscriptionUtil.subscribeToYesNoModal(
      new YesNoModalDto(`${deleteDescription} Tier?`, `Do you want to ${deleteDescription} tier "${tier.name}"?`),
      this.ngx,
      deleteFunction,
    );
  }

  restoreTier(tier: Tier) {
    if (tier.deletedAt) {
      this.datacenterTierService.v1TiersIdRestorePatch({ id: tier.id }).subscribe(data => {
        this.getTiers();
      });
    }
  }

  public importTiersConfig(event: any): void {
    const modalDto = new YesNoModalDto(
      'Import Tiers',
      `Are you sure you would like to import ${event.length} tier${event.length > 1 ? 's' : ''}?`,
    );
    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.datacenterTierService
        .v1TiersBulkPost({
          generatedTierBulkDto: { bulk: dto },
        })
        .subscribe(() => {
          this.getTiers();
        });
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
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

  public getTierGroupName = (id: string): string => ObjectUtil.getObjectName(id, this.tierGroups);

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.currentDatacenter = cd;
        this.getTierGroups(true);
      }
    });
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.tierModalSubscription, this.currentDatacenterSubscription]);
  }
}
