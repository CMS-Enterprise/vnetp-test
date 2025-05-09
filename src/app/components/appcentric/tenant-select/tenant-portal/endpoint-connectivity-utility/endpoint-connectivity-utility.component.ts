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
} from '../../../../../../../client';
import { forkJoin, of, Observable } from 'rxjs';
import { map, switchMap, catchError, defaultIfEmpty } from 'rxjs/operators';

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
    private firewallRulesService: V1NetworkSecurityFirewallRulesService,
  ) {
    // Extract tenant ID from the URL
    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      this.tenantId = match[0].split('/')[2];
    }

    // Initialize form
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

  ngOnInit(): void {
    // Nothing to initialize
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
      (result: any) => {
        this.isLoading = false;
        this.connectivityResult = result;
        console.log('Connectivity results:', result);

        // Ensure fullPath exists for denied connections
        if (
          this.connectivityResult.connectivityResult === 'denied' &&
          (!this.connectivityResult.connectionTrace.fullPath || this.connectivityResult.connectionTrace.fullPath.length === 0)
        ) {
          // Create an empty array if it doesn't exist
          this.connectivityResult.connectionTrace.fullPath = [];

          // For denied connectivity, we'll display source and destination paths separately
          console.log('Handling denied connection with empty fullPath');
        }
      },
      error => {
        this.isLoading = false;
        this.error = error.message || 'An error occurred while testing connectivity';
        console.error('Error testing connectivity:', error);
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

    if (status === 'denied' && this.connectivityResult?.connectivityResult === 'denied-generated-config') {
      return 'status-denied-config';
    }

    switch (status) {
      case 'allowed':
        return 'status-allowed';
      case 'denied':
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
    return status.includes('allowed') || status === 'denied-generated-config';
  }

  // Check if we should show generated config details
  shouldShowGeneratedConfig(): boolean {
    if (!this.connectivityResult || !this.connectivityResult.generatedConfig) {
      return false;
    }

    return (
      this.connectivityResult.connectivityResult === 'denied-generated-config' ||
      (this.connectivityResult.connectivityResult === 'denied' && this.connectivityForm.value.generateConfig)
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
      const { /* id, */ ...contractData } = contractInput; // Destructure to separate id (even if commented out, it implies separation)
      return { ...contractData, id: undefined }; // Explicitly set id to undefined
    });
    return this.contractsService.createManyContract({ createManyContractDto: { bulk: contractsToCreateDto } }).pipe(
      map(response => this._handleApiResponse<Contract>(response)),
      catchError(err => {
        this.error = 'Error creating contracts: ' + (err.error?.message || err.message);
        console.error('Error creating contracts:', err);
        return of([] as Contract[]);
      }),
    );
  }

  private _createFilters$(filtersToCreateInput: any[]): Observable<Filter[]> {
    if (!filtersToCreateInput || filtersToCreateInput.length === 0) {
      return of([]);
    }
    const filtersToCreateDto = filtersToCreateInput.map(filterInput => {
      const { /* id, */ ...filterData } = filterInput; // Destructure to separate id (even if commented out, it implies separation)
      return { ...filterData, id: undefined }; // Explicitly set id to undefined
    });
    return this.filtersService.createManyFilter({ createManyFilterDto: { bulk: filtersToCreateDto } }).pipe(
      map(response => this._handleApiResponse<Filter>(response)),
      catchError(err => {
        this.error = 'Error creating filters: ' + (err.error?.message || err.message);
        console.error('Error creating filters:', err);
        return of([] as Filter[]);
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
    const subjectsToCreate = subjectsToCreateInput
      .map(subjectInput => {
        const { /* id, */ ...subjectData } = subjectInput; // id is for the subject itself
        let contractIdToUse = subjectData.contractId;

        if (!existingContractFlag) {
          const foundNewContract = createdContracts.find(c => c.name === subjectInput.contractId);
          if (foundNewContract && foundNewContract.id) {
            contractIdToUse = foundNewContract.id;
          } else {
            console.error(
              `RESOLVE_ERROR: New contract UUID for name '${subjectInput.contractId}' not found ` +
                `for subject '${subjectData.name || 'Unnamed Subject'}'. Subject creation may fail or be skipped.`,
            );
            return null;
          }
        }
        // Explicitly set subject's own id to undefined for auto-generation
        return { ...subjectData, contractId: contractIdToUse, id: undefined };
      })
      .filter(s => s !== null) as unknown[] as ApiSubject[]; // Adjusted type assertion for now

    if (subjectsToCreate.length === 0 && subjectsToCreateInput.length > 0) {
      console.warn('All subjects were filtered out due to missing contract ID references. No subjects will be created.');
      return of([]);
    }
    if (subjectsToCreate.length === 0) {
      return of([]);
    }

    return this.subjectsService.createManySubject({ createManySubjectDto: { bulk: subjectsToCreate as any } }).pipe(
      map(response => this._handleApiResponse<ApiSubject>(response)),
      catchError(err => {
        this.error = 'Error creating subjects: ' + (err.error?.message || err.message);
        console.error('Error creating subjects:', err);
        return of([] as ApiSubject[]);
      }),
    );
  }

  private _createFilterEntries$(filterEntriesToCreateInput: any[], createdFilters: Filter[]): Observable<FilterEntry[]> {
    if (!filterEntriesToCreateInput || filterEntriesToCreateInput.length === 0) {
      return of([]);
    }
    const filterEntriesToCreate = filterEntriesToCreateInput
      .map(feInput => {
        const { /* id, */ filterId, ...feData } = feInput; // id is for the filter entry
        let actualFilterId: string | undefined;
        const originalFilterIdName = filterId;

        const foundFilter = createdFilters.find(f => f.name === originalFilterIdName);
        if (foundFilter && foundFilter.id) {
          actualFilterId = foundFilter.id;
        } else {
          console.error(
            `RESOLVE_ERROR: Filter UUID for name '${originalFilterIdName}' not found ` +
              `for filter entry '${feData.name || 'Unnamed FilterEntry'}'. Filter Entry creation may fail or be skipped.`,
          );
          return null;
        }
        // Explicitly set filter entry's own id to undefined for auto-generation
        return { ...feData, filterId: actualFilterId, id: undefined };
      })
      .filter(fe => fe !== null) as unknown[] as FilterEntry[]; // Adjusted type assertion for now

    if (filterEntriesToCreate.length === 0 && filterEntriesToCreateInput.length > 0) {
      console.warn('All filter entries were filtered out due to missing filter ID references. No filter entries will be created.');
      return of([]);
    }
    if (filterEntriesToCreate.length === 0) {
      return of([]);
    }

    return this.filterEntriesService.createManyFilterEntry({ createManyFilterEntryDto: { bulk: filterEntriesToCreate as any } }).pipe(
      map(response => this._handleApiResponse<FilterEntry>(response)),
      catchError(err => {
        this.error = 'Error creating filter entries: ' + (err.error?.message || err.message);
        console.error('Error creating filter entries:', err);
        return of([] as FilterEntry[]);
      }),
    );
  }

  private _linkSubjectsToFilters$(
    subjectToFilterLinkInputs: any[],
    createdSubjects: ApiSubject[],
    createdFilters: Filter[],
  ): Observable<any> {
    if (!subjectToFilterLinkInputs || subjectToFilterLinkInputs.length === 0) {
      return of(null);
    }

    const subjectToFilterObservables = subjectToFilterLinkInputs
      .map(stf => {
        const subject = createdSubjects.find(s => s.name === stf.subjectId);
        const filter = createdFilters.find(f => f.name === stf.filterId);

        if (subject && filter && subject.id && filter.id) {
          return this.subjectsService.addFilterToSubjectSubject({ subjectId: subject.id, filterId: filter.id }).pipe(
            catchError(err => {
              console.error(`Error adding filter ${filter.name} to subject ${subject.name}:`, err);
              const linkError = `Error linking ${subject.name} to ${filter.name}`;
              this.error = (this.error ? this.error + '; ' : '') + linkError;
              return of(null);
            }),
          );
        }
        console.warn(`Could not find subject ${stf.subjectId} or filter ${stf.filterId} for relationship. Skipping.`);
        return of(null);
      })
      .filter(obs => obs !== null) as Observable<any>[];

    return subjectToFilterObservables.length > 0 ? forkJoin(subjectToFilterObservables).pipe(defaultIfEmpty(null)) : of(null);
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
                    switchMap(() => this._linkSubjectsToFilters$(generatedConfig.SubjectToFilter || [], createdSubjects, createdFilters)),
                  ),
                ),
              ),
            ),
          ),
        ),
        catchError(err => {
          this.isLoading = false;
          this.error =
            this.error || 'An unexpected error occurred during configuration application: ' + (err.error?.message || err.message);
          console.error('Overall error in applyGeneratedConfig:', err);
          return of(null);
        }),
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
          if (!this.error) {
            console.log('Generated configuration applied successfully.');
          } else {
            console.log('Generated configuration applied with some errors.');
          }
        },
        error: err => {
          this.isLoading = false;
          this.error = this.error || 'Failed to apply generated configuration: ' + (err.error?.message || err.message);
          console.error('Critical error in applyGeneratedConfig subscription:', err);
        },
      });
  }
}
