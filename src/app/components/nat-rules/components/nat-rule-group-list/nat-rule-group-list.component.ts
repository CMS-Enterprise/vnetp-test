import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tier } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, of, Observable } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/subscription.util';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { TierContextService } from 'src/app/services/tier-context.service';
import { mergeMap, tap } from 'rxjs/operators';
import { NatRuleGroupModalDto } from '../../models/nat-rule-group-modal-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NatRuleGroup, NatRuleGroupType } from '../../nat-rules.type';

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

  // TODO: Implement api_client service
  private V1NATRuleGroupsService = {
    softDelete: (o: object) => of({}),
    delete: (o: object) => of({}),
    restore: (o: object) => of({}),
  };

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
    if (natRuleGroup.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const { name, id, deletedAt } = natRuleGroup;
    const deleteDescription = deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFn = () => {
      if (deletedAt) {
        this.V1NATRuleGroupsService.delete({ id }).subscribe(() => this.loadNatRuleGroups(this.currentTier));
      } else {
        this.V1NATRuleGroupsService.softDelete({ id }).subscribe(() => this.loadNatRuleGroups(this.currentTier));
      }
    };

    const dto = new YesNoModalDto(`${deleteDescription} NAT Rule Group?`, `Do you want to ${deleteDescription} NAT Rule Group "${name}"?`);
    this.ngx.setModalData(dto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (data && data.modalYes) {
        deleteFn();
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  public restoreNatRuleGroup(natRuleGroup: NatRuleGroup): void {
    const { deletedAt, id } = natRuleGroup;
    if (deletedAt) {
      this.V1NATRuleGroupsService.restore({ id }).subscribe(() => this.loadNatRuleGroups(this.currentTier));
    }
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
