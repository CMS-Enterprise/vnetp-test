import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PaginationDTO, V1NetworkSecurityZonesService, V1TiersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { EntityService } from 'src/app/services/entity.service';
import { TableContextService } from 'src/app/services/table-context.service';
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

  public searchColumns: SearchColumnConfig[] = [{ displayName: 'Tier Name', propertyName: 'tierId' }];

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
  };
  perPage = 20;
  messages: PaginationDTO;

  public tableComponentDto = new TableComponentDto();
  public isLoadingObjects = false;
  public tiers;
  zones;
  constructor(
    private tableContextService: TableContextService,
    private entityService: EntityService,
    private zoneService: V1NetworkSecurityZonesService,
    private tierService: V1TiersService,
    public ngx: NgxSmartModalService,
  ) {}

  public getTierId(tierName: string): string {
    return ObjectUtil.getObjectId(tierName, this.tiers, 'Error Resolving Name');
  }

  public getZones(event?) {
    this.isLoadingObjects = true;
    const eventParams = [];
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        if (propertyName === 'tierId') {
          const tierId = this.getTierId(searchText);
          eventParams.push(`{"${`${propertyName}`}": {"eq": "${tierId}"}}`);
        } else if (propertyName === 'type') {
          eventParams.push(`{"${`${propertyName}`}": {"eq": "${searchText}"}}`);
        } else {
          eventParams.push(`{"${`${propertyName}`}": {"cont": "${searchText}"}}`);
        }
      }
    }
    this.zoneService
      .getManyZone({
        s: `{"AND": [${eventParams}], "OR": []}`,
        sort: ['updatedAt,ASC'],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.zones = data;
          this.zones.data.map(zone => {
            zone.tierName = ObjectUtil.getObjectName(zone.tierId, this.tiers);
          });
        },
        () => {
          this.isLoadingObjects = false;
        },
        () => {
          this.isLoadingObjects = false;
        },
      );
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
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults, searchString } = params;
      if (filteredResults && !searchString) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.getZones(this.tableComponentDto);
      } else if (filteredResults && searchString) {
        this.getZones(searchString);
      } else {
        this.getZones();
      }
      this.ruleGroupZoneModalSubscription.unsubscribe();
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

  restoreZone(zone): void {
    if (zone.deletedAt) {
      this.zoneService.restoreOneZone({ id: zone.id }).subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults, searchString } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults && !searchString) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.getZones(this.tableComponentDto);
        } else if (filteredResults && searchString) {
          this.getZones(searchString);
        } else {
          this.getZones();
        }
      });
    }
  }

  public deleteZone(zone): void {
    this.entityService.deleteEntity(zone, {
      entityName: 'Zone',
      delete$: this.zoneService.deleteOneZone({ id: zone.id }),
      softDelete$: this.zoneService.softDeleteOneZone({ id: zone.id }),
      onSuccess: () => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults, searchString } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults && !searchString) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.getZones(this.tableComponentDto);
        } else if (filteredResults && searchString) {
          this.getZones(searchString);
        } else {
          this.getZones();
        }
      },
    });
  }

  public importZonesConfig(event): void {
    const modalDto = new YesNoModalDto(
      'Import Firewall Rule Groups',
      `Are you sure you would like to import ${event.length} zone${event.length > 1 ? 's' : ''}?`,
    );

    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.zoneService
        .createManyZone({
          createManyZoneDto: { bulk: dto },
        })
        .subscribe(() => {
          this.getZones();
        });
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  private sanitizeData(entities: any[]): any[] {
    return entities.map(entity => {
      this.mapToCsv(entity);
      return entity;
    });
  }

  private mapToCsv(obj: any): any {
    Object.entries(obj).forEach(([key, val]) => {
      if (val === null || val === '') {
        delete obj[key];
      }
      if (key === 'tier_name' || key === 'tierName') {
        const tierId = this.getTierId(obj[key]);
        obj.tierId = tierId;
        delete obj[key];
      }
    });
    console.log('object', obj);
    return obj;
  }
}
