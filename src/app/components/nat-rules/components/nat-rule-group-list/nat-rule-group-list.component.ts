import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tier } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, of, Observable } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/subscription.util';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TierContextService } from 'src/app/services/tier-context.service';
import { mergeMap, tap } from 'rxjs/operators';
import { NatRuleGroupModalDto } from '../../models/nat-rule-group-modal-dto';

// todo: Use generated types from api_client
enum NatRuleGroupType {
  Intervrf = 'Intervrf',
  External = 'External',
}

interface NatRuleGroup {
  createdAt?: object;
  deletedAt?: boolean;
  id?: string;
  name: string;
  natRules: NatRule[];
  provisionedAt?: object;
  tierId: string;
  type: NatRuleGroupType;
  updatedAt?: object;
}

interface NatRule {
  id: string;
  name: string;
  description: string;
  ruleIndex: number;
}

@Component({
  selector: 'app-nat-rule-group-list',
  templateUrl: './nat-rule-group-list.component.html',
})
export class NatRuleGroupListComponent implements OnInit, OnDestroy {
  public currentPage = 1;
  public currentTier: Tier;
  public perPage = 20;
  public selectedNatRuleGroup: NatRuleGroup;
  public ModalMode = ModalMode;
  public natRuleGroups: NatRuleGroup[] = [];

  private currentTierSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private tierContextService: TierContextService) {}

  public ngOnInit(): void {
    this.currentTierSubscription = this.tierContextService.currentTier
      .pipe(
        tap((tier: Tier) => (this.currentTier = tier)),
        mergeMap((tier: Tier) => this.loadNatRuleGroups(tier)),
      )
      .subscribe((groups: NatRuleGroup[]) => {
        this.natRuleGroups = groups;
      });
  }

  public ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentTierSubscription]);
  }

  public deleteNatRuleGroup(natRuleGroup: NatRuleGroup): void {
    // TODO: Implement
  }

  public restoreNatRuleGroup(natRuleGroup: NatRuleGroup): void {
    // TODO: Implement
  }

  public openNatRuleGroupModal(modalMode: ModalMode, natRuleGroup?: NatRuleGroup): void {
    const modalName = 'natRuleGroupModal';
    const dto: NatRuleGroupModalDto = {
      tierId: this.currentTier.id,
      modalMode,
      natRuleGroup,
    };
    this.ngx.setModalData(dto, modalName);
    this.ngx.open(modalName);
  }

  public openNatRuleGroupDetailsModal(natRuleGroup: NatRuleGroup): void {
    this.selectedNatRuleGroup = natRuleGroup;
    this.ngx.getModal('natRuleGroupDetailsModal').open();
  }

  private loadNatRuleGroups(tier: Tier): Observable<NatRuleGroup[]> {
    const hasCurrentTier = tier && !!tier.id;
    if (!hasCurrentTier) {
      return of([]);
    }
    return of([
      {
        name: 'test',
        type: NatRuleGroupType.External,
        natRules: [
          {
            name: 'Test2',
          },
        ],
      } as any,
    ]);
  }
}
