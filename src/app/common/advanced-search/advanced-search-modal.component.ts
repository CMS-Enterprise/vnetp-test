import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subject, Subscription } from 'rxjs';
import { Tier } from 'client/model/tier';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { SearchColumnConfig } from '../search-bar/search-bar.component';
import { AdvancedSearchAdapter } from './advanced-search.adapter';

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

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder, private tierContextService: TierContextService) {}

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
    if (this.orActive) {
      this.advancedSearchOr();
    } else {
      this.advancedSearchAnd();
    }
  }

  public advancedSearchAnd(): void {
    let baseSearch = '';
    const values = this.form.value;

    baseSearch = `tierId||eq||${this.currentTier.id}`;

    const params = {
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

  public advancedSearchOr(): void {
    const params = {
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
          search.push(`{"${field}": {"$${searchOperator}": "${value}"}}`);
        }
      }
    }

    if (search.length > 1) {
      const searchString = search.toString();
      params.s = `{"tierId": {"$eq": "${this.currentTier.id}"}, "$or": [${searchString}]}`;
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
}
