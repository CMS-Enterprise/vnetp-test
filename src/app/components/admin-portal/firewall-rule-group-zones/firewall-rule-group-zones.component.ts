import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PaginationDTO, V1DatacentersService, V1NetworkSecurityZonesService, V1TiersService, V3GlobalMessagesService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-firewall-rule-group-zones',
  templateUrl: './firewall-rule-group-zones.component.html',
  styleUrls: ['./firewall-rule-group-zones.component.scss'],
})
export class FirewallRuleGroupZonesComponent implements OnInit {
  public fwRuleGroupZoneModalSubscription: Subscription;

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
  constructor(
    private zoneService: V1NetworkSecurityZonesService,
    private datacentersService: V1DatacentersService,
    private tierService: V1TiersService,
    private globalMessagesService: V3GlobalMessagesService,
    public ngx: NgxSmartModalService,
  ) {}

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
        sort: ['updatedAt,ASC'],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(data => {
        this.zones = data;
        this.zones.data.map(zone => {
          zone.tierName = ObjectUtil.getObjectName(zone.tierId, this.tiers);
        });
      });
    // this.datacentersService.getManyDatacenter({page: 1, perPage: 100}).subscribe(data => {
    //   console.log('data',data);
    //   data.data.map(async dc => {
    //     await this.getTiers(dc);
    //     console.log('this.tiers',this.tiers)

    //   })
    // })
  }

  public getTiers() {
    this.tierService.getManyTier({ sort: ['updatedAt,ASC'] }).subscribe(data => {
      this.tiers = data;
    });
  }
  ngOnInit(): void {
    this.getTiers();
    this.getZones();
  }

  public subscribeToFirewallRuleGroupZonesModal(): void {
    this.fwRuleGroupZoneModalSubscription = this.ngx.getModal('firewallRuleGroupZonesModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('firewallRuleGroupZonesModal');
      this.fwRuleGroupZoneModalSubscription.unsubscribe();
      this.getZones();
    });
  }

  public openFWRuleGroupZonesModal(modalMode?): void {
    const dto: any = {};
    dto.ModalMode = modalMode;
    this.subscribeToFirewallRuleGroupZonesModal();
    this.ngx.setModalData(dto, 'firewallRuleGroupZonesModal');
    this.ngx.getModal('firewallRuleGroupZonesModal').open();
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
