import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subject, Subscription } from 'rxjs';
import { Tier } from 'client/model/tier';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { SearchColumnConfig } from '../search-bar/search-bar.component';
import { AdvancedSearchAdapter } from './advanced-search.adapter';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-advanced-search-modal',
  templateUrl: './advanced-search-modal.component.html',
})
export class AdvancedSearchComponent<T> implements OnInit, OnDestroy {
  @Input() formInputs: SearchColumnConfig[];
  form: FormGroup;
  submitted: boolean;

  @Input() advancedSearchAdapterSubject: Subject<any>;
  private advancedSearchAdapterSubscription: Subscription;
  public advancedSearchAdapter: AdvancedSearchAdapter<T>;

  @Output() advancedSearchResults = new EventEmitter<any>();

  public currentTierSubscription: Subscription;
  public currentTier: Tier;
  public orActive = true;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private tierContextService: TierContextService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.advancedSearchAdapterSubscription = this.advancedSearchAdapterSubject.subscribe((advancedSearchAdapter: any) => {
      if (advancedSearchAdapter) {
        this.advancedSearchAdapter = advancedSearchAdapter;
      }
    });

    this.currentTierSubscription = this.tierContextService.currentTier.subscribe(ct => {
      if (ct) {
        this.currentTier = ct;
      }
    });

    this.buildForm();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentTierSubscription, this.advancedSearchAdapterSubscription]);
  }

  public reset() {
    this.ngx.resetModalData('advancedSearch');
    this.buildForm();
  }

  public closeModal(): void {
    this.ngx.close('advancedSearch');
    this.reset();
    this.buildForm();
  }

  public onOpen(): void {
    this.ngx.resetModalData('advancedSearch');
  }

  get f() {
    return this.form.controls;
  }

  public searchThis(): void {
    const baseSearchProperty = this.getBaseSearchProperty();
    const baseSearchValue = this.getBaseSearchValue();
    if (this.orActive) {
      this.advancedSearchOr(baseSearchProperty, baseSearchValue);
    } else {
      this.advancedSearchAnd(baseSearchProperty, baseSearchValue);
    }
  }

  public advancedSearchAnd(baseSearchProperty: string, baseSearchValue: string): void {
    const baseSearch = `${baseSearchProperty}||eq||${baseSearchValue}`;
    const values = this.form.value;

    const params: Params = {
      filter: [],
      page: 1,
      limit: 20,
      sort: ['name,ASC'],
    };

    if (baseSearch) {
      params.filter.push(baseSearch);
    }

    for (const field in values) {
      if (values.hasOwnProperty(field)) {
        const value = values[field];
        if (value !== '') {
          const searchColumn = this.formInputs.find(column => column.propertyName === field);
          const searchOperator = searchColumn && searchColumn.searchOperator ? searchColumn.searchOperator : 'eq';
          params.join = searchColumn.join;
          params.filter.push(`${field}||${searchOperator}||${value}`);
        }
      }
    }

    if (params.filter.length > 1) {
      this.advancedSearchAdapter.getMany(params).subscribe(data => {
        this.advancedSearchResults.emit(data);
      });
    }

    this.closeModal();
  }

  public advancedSearchOr(baseSearchProperty: string, baseSearchValue: string): void {
    const params: Params = {
      s: '',
      page: 1,
      limit: 20,
      sort: ['name,ASC'],
    };

    const search = [];
    const values = this.form.value;

    for (const field in values) {
      if (values.hasOwnProperty(field)) {
        const value = values[field];
        if (value !== '') {
          const searchColumn = this.formInputs.find(column => column.propertyName === field);
          const searchOperator = searchColumn && searchColumn.searchOperator ? searchColumn.searchOperator : 'eq';
          params.join = searchColumn.join;
          search.push(`{"${field}": {"$${searchOperator}": "${value}"}}`);
        }
      }
    }

    if (search.length > 0) {
      const searchString = search.concat().toString();
      params.s = `{"${baseSearchProperty}": {"$eq": "${baseSearchValue}"}, "$or": [${searchString}]}`;
      this.advancedSearchAdapter.getMany(params).subscribe(data => {
        this.advancedSearchResults.emit(data);
      });
    }

    this.closeModal();
  }

  public buildForm(): void {
    const group: FormGroup = this.formBuilder.group({});

    this.formInputs.forEach(input => {
      group.addControl(input.propertyName, this.formBuilder.control(''));
    });

    this.form = group;
  }

  public getServiceType(): string {
    return this.advancedSearchAdapter.service.constructor.name;
  }

  public getBaseSearchProperty(): string {
    const serviceType = this.getServiceType();
    let baseSearchProperty = 'tierId';

    if (serviceType.includes('V2')) {
      baseSearchProperty = 'tenant';
    } else if (serviceType.includes('FirewallRule')) {
      baseSearchProperty = 'firewallRuleGroupId';
    } else if (serviceType.includes('NatRule')) {
      baseSearchProperty = 'natRuleGroupId';
    }

    return baseSearchProperty;
  }

  public getBaseSearchValue(): string {
    const baseSearchProperty = this.getBaseSearchProperty();
    let baseSearchValue = this.currentTier.id;

    if (baseSearchProperty === 'tenant' || baseSearchProperty === 'firewallRuleGroupId' || baseSearchProperty === 'natRuleGroupId') {
      baseSearchValue = this.route.snapshot.paramMap.get('id');
    }

    return baseSearchValue;
  }
}

interface Params {
  filter?: string[];
  s?: string;
  page: number;
  limit: number;
  sort: string[];
  join?: string[];
}
