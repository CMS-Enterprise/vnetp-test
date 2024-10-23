import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Tier, V1TiersService, NatRuleGroup } from 'client';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-nat-rule-group',
  templateUrl: './nat-rule-group.component.html',
  styleUrls: ['./nat-rule-group.component.scss'],
})
export class NatRuleGroupComponent implements OnInit, OnDestroy {
  public currentNatRulePage = 1;
  public perPage = 50;
  public currentTier: Tier;
  tiers;
  natRuleGroups = [];
  public natRuleGroupModalSubscription: Subscription;
  dropdownOpen: boolean = false;
  filteredTier = false;
  filteredTierObject;

  private currentTierSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private tierService: V1TiersService) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement; // Cast to HTMLElement
    if (!clickedElement.closest('.dropdown')) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    console.log('this.filteredTier', this.filteredTier);
    this.dropdownOpen = !this.dropdownOpen;
  }

  public filterTier(filterTier) {
    this.filteredTier = !this.filteredTier;
    this.filteredTierObject = filterTier;
    if (this.filteredTier) {
      return this.getTierByName(filterTier);
    } else {
      return this.getTiers();
    }
  }

  public getTierByName(tierName?): void {
    this.natRuleGroups = [];
    this.filteredTier = true;
    this.tierService
      .getOneTier({
        id: tierName.id,
        join: ['natRuleGroups'],
      })
      .subscribe(data => {
        this.natRuleGroups = data.natRuleGroups;
      });
  }

  public getTiers(): void {
    this.natRuleGroups = [];
    this.tierService
      .getManyTier({
        join: ['natRuleGroups'],
      })
      .subscribe(data => {
        this.tiers = data;
        this.tiers.map(tier => {
          tier.natRuleGroups.map(group => {
            this.natRuleGroups.push(group);
          });
        });
      });
  }

  public subscribeToNatRuleGroupModal(): void {
    this.natRuleGroupModalSubscription = this.ngx.getModal('natRuleGroupModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('natRuleGroupModal');
      this.natRuleGroupModalSubscription.unsubscribe();
      console.log('this.filteredTier', this.filteredTier);
      console.log('this.filteredTierObject', this.filteredTierObject);
      if (this.filteredTier) {
        return this.getTierByName(this.filteredTierObject);
      }
      this.getTiers();
    });
  }

  public openFWRuleGroupModal(modalMode?): void {
    const dto: any = {};
    dto.ModalMode = modalMode;
    this.subscribeToNatRuleGroupModal();
    this.ngx.setModalData(dto, 'natRuleGroupModal');
    this.ngx.getModal('natRuleGroupModal').open();
  }

  public filterNatRuleGroup = (natRuleGroup: NatRuleGroup): boolean => natRuleGroup.name !== 'Intravrf';

  public getTierName(tierId: string): string {
    return ObjectUtil.getObjectName(tierId, this.tiers, 'Error Resolving Name');
  }

  ngOnInit(): void {
    this.getTiers();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentTierSubscription]);
  }

  // public importNatRuleGroupsConfig(event): void {
  //   const modalDto = new YesNoModalDto(
  //     'Import Nat Rule Groups',
  //     `Are you sure you would like to import ${event.length} nat rule group${event.length > 1 ? 's' : ''}?`,
  //   );

  //   const onConfirm = () => {
  //     const dto = this.sanitizeData(event);
  //     this.natRuleGroupService
  //       .createManyNatRuleGroup({
  //         createManyNatRuleGroupDto: { bulk: dto },
  //       })
  //       .subscribe(() => {
  //         this.getTiers();
  //       });
  //   };

  //   SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  // }

  // private sanitizeData(entities: any[]): any[] {
  //   return entities.map(entity => {
  //     this.mapToCsv(entity);
  //     return entity;
  //   });
  // }

  // private mapToCsv(obj: any): any {
  //   Object.entries(obj).forEach(([key, val]) => {
  //     if (val === null || val === '') {
  //       delete obj[key];
  //     }
  //     if (key === 'ipAddress') {
  //       obj[key] = String(val).trim();
  //     }
  //     if (key === 'vrf_name' || key === 'vrfName') {
  //       obj[key] = ObjectUtil.getObjectId(val as string, [this.currentTier]);
  //       obj.tierId = obj[key];
  //       delete obj[key];
  //     }
  //   });
  //   return obj;
  // }
}
