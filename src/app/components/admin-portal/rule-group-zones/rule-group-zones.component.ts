import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PaginationDTO, V1NetworkSecurityZonesService, V1TiersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-rule-group-zones',
  templateUrl: './rule-group-zones.component.html',
  styleUrls: ['./rule-group-zones.component.scss'],
})
export class RuleGroupZonesComponent implements OnInit {
  public ruleGroupZoneModalSubscription: Subscription;

  ModalMode = ModalMode;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  public config: TableConfig<any> = {
    description: 'zones',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Description', property: 'description' },
      { name: 'Tier Name', property: 'tierName' },
      { name: '', template: () => this.actionsTemplate },
    ],
    hideAdvancedSearch: true,
    hideSearchBar: true,
  };
  perPage = 20;
  messages: PaginationDTO;

  public tableComponentDto = new TableComponentDto();
  public tiers;
  zones;
  constructor(private zoneService: V1NetworkSecurityZonesService, private tierService: V1TiersService, public ngx: NgxSmartModalService) {}

  public getZones(event?) {
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 10;
    } else {
      this.tableComponentDto.perPage = this.perPage;
    }
    this.zoneService
      .getManyZone({
        filter: ['deletedAt||isnull'],
        sort: ['updatedAt,DESC'],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(data => {
        this.zones = data;
        this.zones.data.map(zone => {
          zone.tierName = ObjectUtil.getObjectName(zone.tierId, this.tiers);
        });
      });
  }

  public getTiers() {
    this.tierService.getManyTier({ page: 1, perPage: 500, sort: ['updatedAt,ASC'] }).subscribe(data => {
      this.tiers = data.data;
    });
  }
  ngOnInit(): void {
    this.getTiers();
    this.getZones();
  }

  public subscribeToRuleGroupZonesModal(): void {
    this.ruleGroupZoneModalSubscription = this.ngx.getModal('ruleGroupZonesModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('ruleGroupZonesModal');
      this.ruleGroupZoneModalSubscription.unsubscribe();
      this.getZones();
    });
  }

  public openRuleGroupZonesModal(modalMode?): void {
    const dto: any = {};
    dto.ModalMode = modalMode;
    this.subscribeToRuleGroupZonesModal();
    this.ngx.setModalData(dto, 'ruleGroupZonesModal');
    this.ngx.getModal('ruleGroupZonesModal').open();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getZones(event);
  }

  public deleteEntry(zone): void {
    const dto = new YesNoModalDto('Delete Zone?', `"${zone.name}"`);
    const onConfirm = () => {
      this.zoneService.deleteOneZone({ id: zone.id }).subscribe(() => {
        this.getZones();
      });
    };

    const onClose = () => {
      this.getZones();
    };
    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, onConfirm, onClose);
  }
}
