import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilitiesService } from 'client/api/utilities.service';
import { Router } from '@angular/router';
import {
  EndpointConnectionUtilityResponse,
  V1NetworkSecurityFirewallRulesService,
  V2AppCentricFilterEntriesService,
  V2AppCentricFiltersService,
  V2AppCentricSubjectsService,
  V2AppCentricContractsService,
  Contract,
  Subject as ApiSubject,
  Filter,
  FilterEntry,
  ContractToEpg,
  ContractToEsg,
  V2AppCentricEndpointGroupsService,
  V2AppCentricEndpointSecurityGroupsService,
  ContractToEpgContractRelationTypeEnum,
  ContractToEsgContractRelationTypeEnum,
} from '../../../../../../../client';
import { forkJoin, of, Observable, throwError } from 'rxjs';
import { map, switchMap, catchError, defaultIfEmpty } from 'rxjs/operators';
import { EndpointConnectionUtilityResponseConnectivityResultEnum } from '../../../../../../../client';

@Component({
  selector: 'app-endpoint-connectivity-utility',
  templateUrl: './endpoint-connectivity-utility.component.html',
  styleUrls: ['./endpoint-connectivity-utility.component.scss'],
})
export class EndpointConnectivityUtilityComponent implements OnInit {
  // Form controls
  connectivityForm: FormGroup;

  // State management
  isLoading = false;
  error: string | null = null;
  tenantId: string;

  // API response data
  connectivityResult: EndpointConnectionUtilityResponse | null = null;

  // Protocol options for the form
  protocolOptions = ['tcp', 'udp', 'icmp'];

  constructor(
    private fb: FormBuilder,
    private utilitiesService: UtilitiesService,
    private router: Router,
    private subjectsService: V2AppCentricSubjectsService,
    private filtersService: V2AppCentricFiltersService,
    private contractsService: V2AppCentricContractsService,
    private filterEntriesService: V2AppCentricFilterEntriesService,
    private endpointGroupsService: V2AppCentricEndpointGroupsService,
    private endpointSecurityGroupsService: V2AppCentricEndpointSecurityGroupsService,
    private firewallRulesService: V1NetworkSecurityFirewallRulesService,
  ) {}

  ngOnInit(): void {
    // Extract tenant ID from the URL
    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      this.tenantId = match[0].split('/')[2];
    }

    this.connectivityForm = this.fb.group({
      generatedConfigIdentifier: ['connectivity-test-' + Date.now(), Validators.required],
      sourceEndpointIp: ['', [Validators.required, Validators.pattern('^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$')]],
      sourceEndpointPort: [null],
      destinationEndpointIp: ['', [Validators.required, Validators.pattern('^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$')]],
      destinationEndpointPort: ['', [Validators.required, Validators.pattern('^\\d+$')]],
      ipProtocol: ['tcp', Validators.required],
      bypassServiceGraph: [true],
      generateConfig: [false],
      applyConfig: [false],
      bidirectional: [false],
    });
  }

  // Submit form to test connectivity
  onSubmit(): void {
    if (this.connectivityForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formValue = this.connectivityForm.value;

    // Prepare the query object for the API
    const query = {
      generatedConfigIdentifier: formValue.generatedConfigIdentifier,
      sourceEndpointIp: formValue.sourceEndpointIp,
      sourceEndpointPort: formValue.sourceEndpointPort ? Number(formValue.sourceEndpointPort) : undefined,
      destinationEndpointIp: formValue.destinationEndpointIp,
      destinationEndpointPort: Number(formValue.destinationEndpointPort),
      ipProtocol: formValue.ipProtocol,
      bypassServiceGraph: formValue.bypassServiceGraph,
      generateConfig: formValue.generateConfig,
      applyConfig: formValue.applyConfig,
      bidirectional: formValue.bidirectional,
      tenantId: this.tenantId,
    };

    this.utilitiesService.generateConnectivityReportUtilities({ endpointConnectivityQuery: query }).subscribe(
      (result: EndpointConnectionUtilityResponse) => {
        this.isLoading = false;
        this.connectivityResult = result;

        if (
          this.connectivityResult.connectivityResult === 'denied' &&
          (!this.connectivityResult.connectionTrace.fullPath || this.connectivityResult.connectionTrace.fullPath.length === 0)
        ) {
          this.connectivityResult.connectionTrace.fullPath = [];
        }
      },
      error => {
        this.isLoading = false;
        this.error = error.message || 'An error occurred while testing connectivity';
      },
    );
  }

  // Reset the form
  resetForm(): void {
    this.connectivityForm.reset({
      generatedConfigIdentifier: 'connectivity-test-' + Date.now(),
      ipProtocol: 'tcp',
      bypassServiceGraph: true,
      generateConfig: false,
      applyConfig: false,
      bidirectional: false,
    });
    this.connectivityResult = null;
    this.error = null;
  }

  // Helper method to get the connection status for display
  getConnectionStatus(): string {
    if (!this.connectivityResult) {
      return 'unknown';
    }

    const status = this.connectivityResult.connectivityResult;

    if (status.includes('allowed')) {
      return 'allowed';
    } else if (status.includes('denied')) {
      return 'denied';
    } else {
      return status;
    }
  }

  // Get appropriate CSS class for status display
  getStatusClass(): string {
    const status = this.getConnectionStatus();

    if (
      status === 'denied' &&
      this.connectivityResult?.connectivityResult === EndpointConnectionUtilityResponseConnectivityResultEnum.DeniedGeneratedConfig
    ) {
      return 'status-denied-config';
    }

    switch (status) {
      case EndpointConnectionUtilityResponseConnectivityResultEnum.Allowed:
        return 'status-allowed';
      case EndpointConnectionUtilityResponseConnectivityResultEnum.Denied:
        return 'status-denied';
      default:
        return 'status-unknown';
    }
  }

  // Check if result is allowed or would be allowed with generated config
  isConnectionAllowed(): boolean {
    if (!this.connectivityResult) {
      return false;
    }

    const status = this.connectivityResult.connectivityResult;
    return status.includes('allowed') || status === EndpointConnectionUtilityResponseConnectivityResultEnum.DeniedGeneratedConfig;
  }

  // Check if we should show generated config details
  shouldShowGeneratedConfig(): boolean {
    if (!this.connectivityResult || !this.connectivityResult.generatedConfig) {
      return false;
    }

    return (
      this.connectivityResult.connectivityResult === EndpointConnectionUtilityResponseConnectivityResultEnum.DeniedGeneratedConfig ||
      (this.connectivityResult.connectivityResult === EndpointConnectionUtilityResponseConnectivityResultEnum.Denied &&
        this.connectivityForm.value.generateConfig)
    );
  }

  // Get a simple description of the connection result
  getConnectionDetail(): string {
    return this.connectivityResult?.connectivityResultDetail || '';
  }

  // Helper to check if a path has nodes
  hasPathNodes(pathType: 'source' | 'contract' | 'destination' | 'full'): boolean {
    if (!this.connectivityResult || !this.connectivityResult.connectionTrace) {
      return false;
    }

    switch (pathType) {
      case 'source':
        return this.connectivityResult.connectionTrace.sourcePath && this.connectivityResult.connectionTrace.sourcePath.length > 0;
      case 'contract':
        return this.connectivityResult.connectionTrace.contractPath && this.connectivityResult.connectionTrace.contractPath.length > 0;
      case 'destination':
        return (
          this.connectivityResult.connectionTrace.destinationPath && this.connectivityResult.connectionTrace.destinationPath.length > 0
        );
      case 'full':
        return this.connectivityResult.connectionTrace.fullPath && this.connectivityResult.connectionTrace.fullPath.length > 0;
      default:
        return false;
    }
  }

  // Get an appropriate color for node types
  getNodeColor(nodeType: string, isGenerated: boolean = false): string {
    if (isGenerated) {
      return '#27ae60'; // Green for generated nodes
    }

    switch (nodeType) {
      case 'endpoint':
        return '#2c3e50'; // Dark blue
      case 'epg':
        return '#3498db'; // Blue
      case 'esg':
        return '#16a085'; // Green
      case 'contract':
        return '#9b59b6'; // Purple
      case 'subject':
        return '#6c757d'; // Gray
      case 'filter':
        return '#e67e22'; // Orange
      case 'filter_entry':
        return '#e74c3c'; // Red
      default:
        return '#f8f9fa'; // Light gray
    }
  }

  // Get text color based on background
  getNodeTextColor(nodeType: string): string {
    return ['endpoint', 'esg', 'epg', 'contract'].includes(nodeType) ? '#ffffff' : '#212529';
  }

  private _handleApiResponse<T>(response: any): T[] {
    return response && response.data ? response.data : Array.isArray(response) ? response : [];
  }

  private _createContracts$(contractsToCreateInput: any[], existingContractFlag: boolean): Observable<Contract[]> {
    if (!contractsToCreateInput || contractsToCreateInput.length === 0 || existingContractFlag) {
      return of([]);
    }
    const contractsToCreateDto = contractsToCreateInput.map(contractInput => {
      const { ...contractData } = contractInput;
      return { ...contractData, id: undefined };
    });
    return this.contractsService.createManyContract({ createManyContractDto: { bulk: contractsToCreateDto } }).pipe(
      map(response => this._handleApiResponse<Contract>(response)),
      catchError(err => {
        const errorMessage = 'Error creating contracts: ' + (err.error?.message || err.message);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  private _createFilters$(filtersToCreateInput: any[]): Observable<Filter[]> {
    if (!filtersToCreateInput || filtersToCreateInput.length === 0) {
      return of([]);
    }
    const filtersToCreateDto = filtersToCreateInput.map(filterInput => {
      const { ...filterData } = filterInput;
      return { ...filterData, id: undefined };
    });
    return this.filtersService.createManyFilter({ createManyFilterDto: { bulk: filtersToCreateDto } }).pipe(
      map(response => this._handleApiResponse<Filter>(response)),
      catchError(err => {
        const errorMessage = 'Error creating filters: ' + (err.error?.message || err.message);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  private _createSubjects$(
    subjectsToCreateInput: any[],
    createdContracts: Contract[],
    existingContractFlag: boolean,
  ): Observable<ApiSubject[]> {
    if (!subjectsToCreateInput || subjectsToCreateInput.length === 0) {
      return of([]);
    }

    // Perform mapping, throw error if any ID resolution fails
    let dtos;
    try {
      dtos = subjectsToCreateInput.map(subjectInput => {
        const { ...subjectData } = subjectInput;
        let contractIdToUse = subjectData.contractId;

        if (!existingContractFlag) {
          const foundNewContract = createdContracts.find(c => c.name === subjectInput.contractId);
          if (foundNewContract && foundNewContract.id) {
            contractIdToUse = foundNewContract.id;
          } else {
            throw new Error(
              `ID_RESOLVE_FAIL: New contract UUID for name '${subjectInput.contractId}' not found ` +
                `for subject '${subjectData.name || 'Unnamed Subject'}'.`,
            );
          }
        }
        return { ...subjectData, contractId: contractIdToUse, id: undefined };
      });
    } catch (e) {
      return throwError(() => e); // Propagate mapping error as observable error
    }

    if (dtos.length === 0 && subjectsToCreateInput.length > 0) {
      // This case implies all inputs failed mapping and an error was already thrown by the first one.
      // Or if some other logic (not present here) filtered them all out after successful mapping.
      // For safety, if we reach here with empty dtos but had inputs, it's an issue.
      return throwError(() => new Error('No valid subjects to process after ID resolution attempts.'));
    }
    if (dtos.length === 0) {
      // No inputs originally, or all failed (error already thrown by map)
      return of([]);
    }

    return this.subjectsService.createManySubject({ createManySubjectDto: { bulk: dtos } }).pipe(
      map(response => this._handleApiResponse<ApiSubject>(response)),
      catchError(err => {
        const errorMessage = 'Error creating subjects: ' + (err.error?.message || err.message);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  private _createFilterEntries$(filterEntriesToCreateInput: any[], createdFilters: Filter[]): Observable<FilterEntry[]> {
    if (!filterEntriesToCreateInput || filterEntriesToCreateInput.length === 0) {
      return of([]);
    }

    let dtos;
    try {
      dtos = filterEntriesToCreateInput.map(feInput => {
        const { filterId, ...feData } = feInput;
        let actualFilterId: string | undefined;
        const originalFilterIdName = filterId;

        const foundFilter = createdFilters.find(f => f.name === originalFilterIdName);
        if (foundFilter && foundFilter.id) {
          actualFilterId = foundFilter.id;
        } else {
          throw new Error(
            `ID_RESOLVE_FAIL: Filter UUID for name '${originalFilterIdName}' not found ` +
              `for filter entry '${feData.name || 'Unnamed FilterEntry'}'.`,
          );
        }
        return { ...feData, filterId: actualFilterId, id: undefined };
      });
    } catch (e) {
      return throwError(() => e); // Propagate mapping error
    }

    if (dtos.length === 0 && filterEntriesToCreateInput.length > 0) {
      return throwError(() => new Error('No valid filter entries to process after ID resolution attempts.'));
    }
    if (dtos.length === 0) {
      return of([]);
    }

    return this.filterEntriesService.createManyFilterEntry({ createManyFilterEntryDto: { bulk: dtos } }).pipe(
      map(response => this._handleApiResponse<FilterEntry>(response)),
      catchError(err => {
        const errorMessage = 'Error creating filter entries: ' + (err.error?.message || err.message);
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  private _linkSubjectsToFilters$(
    subjectToFilterLinkInputs: any[],
    createdSubjects: ApiSubject[],
    createdFilters: Filter[],
  ): Observable<any> {
    if (!subjectToFilterLinkInputs || subjectToFilterLinkInputs.length === 0) {
      return of(null); // No links to process, considered success for this step
    }

    const subjectToFilterObservables = subjectToFilterLinkInputs.map(stf => {
      const subject = createdSubjects.find(s => s.name === stf.subjectId);
      const filter = createdFilters.find(f => f.name === stf.filterId);

      if (subject && filter && subject.id && filter.id) {
        return this.subjectsService.addFilterToSubjectSubject({ subjectId: subject.id, filterId: filter.id }).pipe(
          catchError(err => {
            const linkError = `Error linking subject '${subject.name}' to filter '${filter.name}': ` + (err.error?.message || err.message);
            return throwError(() => new Error(linkError));
          }),
        );
      }
      // If subject or filter (or their IDs) not found, throw an error to fail the operation
      const errorMessage =
        `LINK_FAIL: Could not find subject '${stf.subjectId}' (ID: ${subject?.id}) ` +
        `or filter '${stf.filterId}' (ID: ${filter?.id}) for relationship.`;
      return throwError(() => new Error(errorMessage));
    });
    // No longer filter obs, forkJoin will fail if any observable in the array errors.
    return subjectToFilterObservables.length > 0 ? forkJoin(subjectToFilterObservables).pipe(defaultIfEmpty(null)) : of(null);
  }

  private _linkContractToEpgs$(
    contractToEpgLinks: ContractToEpg[],
    createdOrExistingContracts: Contract[],
    isExistingContractScenario: boolean,
  ): Observable<any> {
    if (!contractToEpgLinks || contractToEpgLinks.length === 0) {
      return of(null);
    }

    const linkObservables = contractToEpgLinks.map(link => {
      let actualContractId: string;
      if (isExistingContractScenario) {
        actualContractId = link.contractId;
      } else {
        const foundContract = createdOrExistingContracts.find(c => c.name === link.contractId);
        if (foundContract && foundContract.id) {
          actualContractId = foundContract.id;
        } else {
          return throwError(
            () => new Error(`LINK_FAIL: Could not resolve contract name '${link.contractId}' to a contract ID for EPG linking.`),
          );
        }
      }

      let serviceCall$: Observable<any>;
      const params = { contractId: actualContractId, endpointGroupId: link.epgId };

      switch (link.contractRelationType) {
        case ContractToEpgContractRelationTypeEnum.Consumer:
          serviceCall$ = this.endpointGroupsService.addConsumedContractToEndpointGroupEndpointGroup(params);
          break;
        case ContractToEpgContractRelationTypeEnum.Provider:
          serviceCall$ = this.endpointGroupsService.addProvidedContractToEndpointGroupEndpointGroup(params);
          break;
        case ContractToEpgContractRelationTypeEnum.Intra:
          serviceCall$ = this.endpointGroupsService.addIntraContractToEndpointGroupEndpointGroup(params);
          break;
        default:
          return throwError(
            () =>
              new Error(
                `LINK_FAIL: Unknown contractRelationType '${link.contractRelationType}' for EPG link with contract '${actualContractId}'.`,
              ),
          );
      }

      return serviceCall$.pipe(
        catchError(err => {
          const linkError =
            `Error linking contract '${actualContractId}' (${link.contractRelationType}) to EPG '${link.epgId}': ` +
            (err.error?.message || err.message);
          return throwError(() => new Error(linkError));
        }),
      );
    });

    // Filter out any error observables that were returned directly from map (e.g., ID resolution failure)
    // These are already throwError instances.
    const validObservables = linkObservables.filter(obs => obs && typeof obs.subscribe === 'function');
    const errorContainers = linkObservables.filter(obs => !(obs && typeof obs.subscribe === 'function'));

    if (errorContainers.length > 0) {
      // If ID resolution failed, errorContainers[0] is the throwError observable. Return it directly.
      return errorContainers[0] as Observable<never>;
    }

    return validObservables.length > 0 ? forkJoin(validObservables).pipe(defaultIfEmpty(null)) : of(null);
  }

  private _linkContractToEsgs$(
    contractToEsgLinks: ContractToEsg[],
    createdOrExistingContracts: Contract[],
    isExistingContractScenario: boolean,
  ): Observable<any> {
    if (!contractToEsgLinks || contractToEsgLinks.length === 0) {
      return of(null);
    }

    const linkObservables = contractToEsgLinks.map(link => {
      let actualContractId: string;
      if (isExistingContractScenario) {
        actualContractId = link.contractId;
      } else {
        const foundContract = createdOrExistingContracts.find(c => c.name === link.contractId);
        if (foundContract && foundContract.id) {
          actualContractId = foundContract.id;
        } else {
          return throwError(
            () => new Error(`LINK_FAIL: Could not resolve contract name '${link.contractId}' to a contract ID for ESG linking.`),
          );
        }
      }

      let serviceCall$: Observable<any>;
      const params = { contractId: actualContractId, endpointSecurityGroupId: link.esgId };
      switch (link.contractRelationType) {
        case ContractToEsgContractRelationTypeEnum.Consumer:
          serviceCall$ = this.endpointSecurityGroupsService.addConsumedContractToEndpointSecurityGroupEndpointSecurityGroup(params);
          break;
        case ContractToEsgContractRelationTypeEnum.Provider:
          serviceCall$ = this.endpointSecurityGroupsService.addProvidedContractToEndpointSecurityGroupEndpointSecurityGroup(params);
          break;
        case ContractToEsgContractRelationTypeEnum.Intra:
          serviceCall$ = this.endpointSecurityGroupsService.addIntraContractToEndpointSecurityGroupEndpointSecurityGroup(params);
          break;
        default:
          return throwError(
            () =>
              new Error(
                `LINK_FAIL: Unknown contractRelationType '${link.contractRelationType}' for ESG link with contract '${actualContractId}'.`,
              ),
          );
      }

      return serviceCall$.pipe(
        catchError(err => {
          const linkError =
            `Error linking contract '${actualContractId}' (${link.contractRelationType}) to ESG '${link.esgId}': ` +
            (err.error?.message || err.message);
          return throwError(() => new Error(linkError));
        }),
      );
    });

    const validObservables = linkObservables.filter(obs => obs && typeof obs.subscribe === 'function');
    const errorContainers = linkObservables.filter(obs => !(obs && typeof obs.subscribe === 'function'));

    if (errorContainers.length > 0) {
      return errorContainers[0] as Observable<never>;
    }
    return validObservables.length > 0 ? forkJoin(validObservables).pipe(defaultIfEmpty(null)) : of(null);
  }

  applyGeneratedConfig(): void {
    if (!this.connectivityResult || !this.connectivityResult.generatedConfig) {
      return;
    }
    this.isLoading = true;
    this.error = null;

    const generatedConfig = this.connectivityResult.generatedConfig;

    this._createContracts$(generatedConfig.Contracts || [], !!generatedConfig.existingContract)
      .pipe(
        switchMap(createdContracts =>
          this._createFilters$(generatedConfig.Filters || []).pipe(
            switchMap(createdFilters =>
              this._createSubjects$(generatedConfig.Subjects || [], createdContracts, !!generatedConfig.existingContract).pipe(
                switchMap(createdSubjects =>
                  this._createFilterEntries$(generatedConfig.FilterEntries || [], createdFilters).pipe(
                    switchMap((/* _createdFilterEntries */) =>
                      this._linkSubjectsToFilters$(generatedConfig.SubjectToFilter || [], createdSubjects, createdFilters)),
                    switchMap(() =>
                      this._linkContractToEpgs$(generatedConfig.ContractToEpg || [], createdContracts, !!generatedConfig.existingContract),
                    ),
                    switchMap(() =>
                      this._linkContractToEsgs$(generatedConfig.ContractToEsg || [], createdContracts, !!generatedConfig.existingContract),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        catchError(err => throwError(() => err)),
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.error = null;
        },
        error: err => {
          this.isLoading = false;
          this.error = err.message || 'An unexpected error occurred during configuration application.';
        },
      });
  }
}
