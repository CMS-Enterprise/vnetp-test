import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tier } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, of, Observable } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/subscription.util';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TierContextService } from 'src/app/services/tier-context.service';
import { mergeMap, tap } from 'rxjs/operators';
import { NatRuleModalDto } from '../../models/nat-rule-modal-dto';
import { NatRule } from '../../nat-rules.type';

@Component({
  selector: 'app-nat-rule-list',
  templateUrl: './nat-rule-list.component.html',
})
export class NatRuleListComponent implements OnInit, OnDestroy {
  public currentPage = 1;
  public currentTier: Tier;
  public perPage = 20;
  public ModalMode = ModalMode;
  public natRules: NatRule[] = [];

  private currentTierSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private tierContextService: TierContextService) {}

  public ngOnInit(): void {
    this.currentTierSubscription = this.tierContextService.currentTier
      .pipe(
        tap((tier: Tier) => (this.currentTier = tier)),
        mergeMap((tier: Tier) => this.loadNatRules(tier)),
      )
      .subscribe((natRules: NatRule[]) => {
        this.natRules = natRules;
      });
  }

  public ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentTierSubscription]);
  }

  public deleteNatRule(natRule: NatRule): void {
    // TODO: Implement
  }

  public restoreNatRule(natRule: NatRule): void {
    // TODO: Implement
  }

  public openNatRuleModal(modalMode: ModalMode, natRule?: NatRule): void {
    const modalName = 'natRuleModal';
    const dto: NatRuleModalDto = {
      tierId: this.currentTier.id,
      modalMode,
      natRule,
    };
    this.ngx.setModalData(dto, modalName);
    this.ngx.open(modalName);
  }

  private loadNatRules(tier: Tier): Observable<NatRule[]> {
    const hasCurrentTier = tier && !!tier.id;
    if (!hasCurrentTier) {
      return of([]);
    }
    return of([]);
  }
}
