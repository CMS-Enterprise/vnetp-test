import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TierModalDto } from 'src/app/models/network/tier-modal-dto';
import { V1TiersService, Tier, Datacenter, V1TierGroupsService, TierGroup } from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-tiers',
  templateUrl: './tiers.component.html',
})
export class TiersComponent implements OnInit, OnDestroy {
  public ModalMode = ModalMode;
  public currentDatacenter: Datacenter;
  public currentTiersPage = 1;
  public perPage = 20;
  public tierGroups: TierGroup[];
  public tiers: Tier[];

  private currentDatacenterSubscription: Subscription;
  private tierModalSubscription: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private tierGroupService: V1TierGroupsService,
    private tierService: V1TiersService,
  ) {}

  public getTierGroups(loadTiers = false): void {
    this.tierGroupService
      .v1TierGroupsGet({
        filter: `datacenterId||eq||${this.currentDatacenter.id}`,
      })
      .subscribe(data => {
        this.tierGroups = data;

        if (loadTiers) {
          this.getTiers();
        }
      });
  }

  public getTiers(): void {
    this.tierService
      .v1DatacentersDatacenterIdTiersGet({
        datacenterId: this.currentDatacenter.id,
      })
      .subscribe(data => {
        this.tiers = data;
      });
  }

  public openTierModal(modalMode: ModalMode, tier?: Tier): void {
    const dto = new TierModalDto();

    dto.ModalMode = modalMode;
    dto.DatacenterId = this.currentDatacenter.id;

    if (modalMode === ModalMode.Edit) {
      dto.Tier = tier;
    }

    this.subscribeToTierModal();
    this.datacenterContextService.lockDatacenter();
    this.ngx.setModalData(dto, 'tierModal');
    this.ngx.getModal('tierModal').open();
  }

  public deleteTier(tier: Tier): void {
    this.entityService.deleteEntity(tier, {
      entityName: 'Tier',
      delete$: this.tierService.v1TiersIdDelete({ id: tier.id }),
      softDelete$: this.tierService.v1TiersIdSoftDelete({ id: tier.id }),
      onSuccess: () => this.getTiers(),
    });
  }

  public restoreTier(tier: Tier): void {
    if (!tier.deletedAt) {
      return;
    }
    this.tierService.v1TiersIdRestorePatch({ id: tier.id }).subscribe(() => {
      this.getTiers();
    });
  }

  public importTiersConfig(tiers: Tier[]): void {
    const tierEnding = tiers.length > 1 ? 's' : '';
    const modalDto = new YesNoModalDto(
      `Import Tier${tierEnding}`,
      `Would you like to import ${tiers.length} tier${tierEnding}?`,
      `Import Tier${tierEnding}`,
      'Cancel',
    );
    const onConfirm = () => {
      const bulk = this.sanitizeTiers(tiers);
      this.tierService
        .v1TiersBulkPost({
          generatedTierBulkDto: { bulk },
        })
        .subscribe(() => {
          this.getTiers();
        });
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  private sanitizeTiers(tiers: Tier[]): Tier[] {
    const sanitizeTier = (tier: Tier) => {
      Object.entries(tier).forEach(([key, val]) => {
        if (val === 'false' || val === 'f') {
          tier[key] = false;
        }
        if (val === 'true' || val === 't') {
          tier[key] = true;
        }
        if (val === null || val === '') {
          delete tier[key];
        }
      });
      return tier;
    };

    return tiers.map(sanitizeTier);
  }

  public getTierGroupName = (id: string): string => ObjectUtil.getObjectName(id, this.tierGroups);

  private subscribeToTierModal(): void {
    this.tierModalSubscription = this.ngx.getModal('tierModal').onCloseFinished.subscribe(() => {
      this.getTiers();
      this.ngx.resetModalData('tierModal');
      this.datacenterContextService.unlockDatacenter();
      this.tierModalSubscription.unsubscribe();
    });
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
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
