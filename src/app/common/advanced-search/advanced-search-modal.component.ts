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
import { TableContextService } from '../../services/table-context.service';

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

  public ngSelectOptions = {};

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private tierContextService: TierContextService,
    private route: ActivatedRoute,
    private tableContextService: TableContextService,
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

  public closeModal(): void {
    this.ngx.close('advancedSearch');
  }

  public onOpen(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public searchThis(page = 1, perPage = 20, operator?: string, searchString?: string): void {
    this.tableContextService.removeSearchLocalStorage();
    if (!searchString) {
      this.tableContextService.removeAdvancedSearchLocalStorage();
    }
    const baseSearchProperty = this.getBaseSearchProperty();
    const baseSearchValue = this.getBaseSearchValue();

    if (this.orActive || (operator && operator === 'or')) {
      this.advancedSearch('or', baseSearchProperty, baseSearchValue, page, perPage, searchString);
    } else {
      this.advancedSearch('and', baseSearchProperty, baseSearchValue, page, perPage, searchString);
    }
  }

  public advancedSearch(
    queryType: 'and' | 'or',
    baseSearchProperty: string,
    baseSearchValue: string,
    currentPage: number,
    perPage: number,
    searchString?: string,
  ): void {
    const params: Params = {
      s: '',
      page: currentPage,
    };

    let search = [];
    const values = this.form.value;

    for (const field in values) {
      if (values.hasOwnProperty(field)) {
        const value = values[field];
        if (value !== '') {
          const searchColumn = this.formInputs.find(column => column.propertyName === field);
          const searchOperator = searchColumn && searchColumn.searchOperator ? searchColumn.searchOperator : 'eq';
          params.join = searchColumn.join;
          search.push(`{"${field}": {"${searchOperator}": "${value}"}}`);
        }
      }
    }

    if (searchString) {
      const extractedSearch = queryType === 'and' ? this.extractAndSearch(searchString) : this.extractOrSearch(searchString);
      search = [extractedSearch];
    }

    if (search.length > 0) {
      let query = '';
      const searchConcat = search.concat().toString();
      if (queryType === 'and') {
        search.push(`{"${baseSearchProperty}": {"eq": "${baseSearchValue}"}}`);
        query = `{"AND": [${searchConcat}], "OR":[]}`;
      } else {
        query = `{"AND": [{"${baseSearchProperty}": {"eq": "${baseSearchValue}"}}], "OR": [${searchConcat}]}`;
      }
      params.s = query;

      const operation = baseSearchProperty === 'tenantId' ? 'findAll' : 'getMany';
      params[baseSearchProperty === 'tenantId' ? 'perPage' : 'limit'] = perPage;
      params.sort = ['name,ASC'];

      this.advancedSearchAdapter[operation](params).subscribe(data => {
        this.advancedSearchResults.emit(data);
        if (!this.checkAdvancedSearchSet()) {
          this.tableContextService.addAdvancedSearchLocalStorage(queryType, params.s);
        }
      });
    }

    this.closeModal();
  }

  private extractOrSearch(searchString: string): string {
    const match = searchString.match(/\[(.*?)\]/);
    return match && match[1] ? match[1] : '';
  }

  private extractAndSearch(searchString: string): string {
    const match = searchString.match(/\[(.*?)\]/);
    return match && match[1] ? match[1] : '';
  }

  public buildForm(): void {
    const group: FormGroup = this.formBuilder.group({});
    const advancedSearchParams = this.tableContextService.getAdvancedSearchLocalStorage();
    const searchOperator = advancedSearchParams?.searchOperator;
    const searchString = advancedSearchParams?.searchString;
    let parsedSearchString: { [key: string]: any } = {};

    if (searchString) {
      try {
        parsedSearchString = JSON.parse(searchString);
      } catch (error) {
        console.error('Failed to parse searchString:', error);
      }
    }

    if (this.formInputs) {
      this.formInputs.forEach(input => {
        const initialValue = this.getInitialValue(input, searchOperator, parsedSearchString);
        group.addControl(input.propertyName, this.formBuilder.control(initialValue));
        this.setFormControls(input);
      });
    }

    this.form = group;
  }

  private getInitialValue(input: any, searchOperator: string, parsedSearchString: { [key: string]: any }): string {
    if (searchOperator === 'and') {
      return this.getInitialValueForAndOperator(input, parsedSearchString);
    } else if (searchOperator === 'or') {
      return this.getInitialValueForOrOperator(input, parsedSearchString);
    }
    return '';
  }

  private getInitialValueForAndOperator(input: any, parsedSearchString: { [key: string]: any }): string {
    for (const search in parsedSearchString) {
      if (parsedSearchString.hasOwnProperty(search)) {
        const searchArray = parsedSearchString[search].split('||');
        if (searchArray[0] === input.propertyName) {
          return searchArray[2];
        }
      }
    }
    return '';
  }

  private getInitialValueForOrOperator(input: any, parsedSearchString: { [key: string]: any }): string {
    // tslint:disable-next-line:no-string-literal
    const orParams = parsedSearchString['$or'];
    if (!orParams) {
      return '';
    }

    for (const search of orParams) {
      for (const key in search) {
        if (search.hasOwnProperty(key)) {
          if (key === input.propertyName) {
            // tslint:disable-next-line:no-string-literal
            const operator = Object.keys(search[key])[0];
            return search[key][operator];
          }
        }
      }
    }
    return '';
  }

  private setFormControls(input: SearchColumnConfig): void {
    if (this.isEnum(input.propertyType)) {
      const enumValues = this.getEnumValues(input.propertyType);
      this.ngSelectOptions[input.propertyName] = enumValues;
    } else if (input.propertyType === 'boolean') {
      this.ngSelectOptions[input.propertyName] = ['true', 'false'];
    }
  }

  private checkAdvancedSearchSet(): boolean {
    const advancedSearchParams = this.tableContextService.getAdvancedSearchLocalStorage();
    return advancedSearchParams !== null;
  }

  public getServiceType(): string {
    return this.advancedSearchAdapter.service.name;
  }

  public getBaseSearchProperty(): string {
    const serviceType = this.getServiceType();
    let baseSearchProperty = 'tierId';

    if (serviceType.includes('V2')) {
      baseSearchProperty = 'tenantId';
    } else if (serviceType.includes('FirewallRule')) {
      baseSearchProperty = 'firewallRuleGroupId';
    } else if (serviceType.includes('NatRule')) {
      baseSearchProperty = 'natRuleGroupId';
    }

    return baseSearchProperty;
  }

  public getBaseSearchValue(): string {
    const baseSearchProperty = this.getBaseSearchProperty();
    if (baseSearchProperty === 'tenantId' || baseSearchProperty === 'firewallRuleGroupId' || baseSearchProperty === 'natRuleGroupId') {
      return this.getUuidFromUrl();
    }

    return this.currentTier.id;
  }

  public getUuidFromUrl(): string | null {
    let currentRoute = this.route;

    while (currentRoute) {
      const id = currentRoute.snapshot.paramMap.get('id');
      if (id) {
        return id;
      }
      currentRoute = currentRoute.parent;
    }

    return null;
  }

  public isEnum(object: any): boolean {
    if (object === null || object === undefined) {
      return false;
    }
    const values = Object.values(object);
    return values.every((value, index, array) => array.indexOf(value) === index);
  }

  public getEnumValues(e: any) {
    if (e === null || e === undefined) {
      return [];
    }

    return Object.values(e);
  }

  public showPropertyList(property: SearchColumnConfig): boolean {
    if (property.propertyType === 'string' || property.propertyType === 'number') {
      return false;
    }

    if (this.isEnum(property.propertyType) || property.propertyType === 'boolean') {
      return true;
    }

    return false;
  }
}

interface Params {
  filter?: string[];
  s?: string;
  page: number;
  limit?: number;
  perPage?: number;
  sort?: string[];
  join?: string[];
}
