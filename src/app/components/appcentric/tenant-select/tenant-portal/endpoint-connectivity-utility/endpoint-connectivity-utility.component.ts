import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilitiesService } from 'client/api/utilities.service';
import { Router } from '@angular/router';

// Core interfaces for the API response
interface EndpointConnectivityResponse {
  connectivityResult: string;
  connectivityResultDetail: string;
  sourceEndpoint: Endpoint;
  destinationEndpoint: Endpoint;
  connectionTrace: ConnectionTrace;
  generatedConfig?: GeneratedConfig;
}

interface Endpoint {
  id: string;
  name: string | null;
  ipAddress: string;
  macAddress: string | null;
  endpointGroupId: string;
  tenantId: string;
  tenant?: any;
  endpointGroup?: any;
}

interface PathNode {
  nodeId?: string;
  nodeType: string;
  name?: string;
  generated?: boolean;
}

interface ConnectionTrace {
  sourcePath: PathNode[];
  contractPath: PathNode[];
  destinationPath: PathNode[];
  fullPath: PathNode[];
}

interface GeneratedConfig {
  Contracts: any[];
  Subjects: any[];
  Filters: any[];
  FilterEntries: any[];
  SubjectToFilter: any[];
  FirewallRules: any[];
  existingContract: boolean;
}

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
  connectivityResult: EndpointConnectivityResponse | null = null;

  // Protocol options for the form
  protocolOptions = ['tcp', 'udp', 'icmp'];

  constructor(private fb: FormBuilder, private utilitiesService: UtilitiesService, private router: Router) {
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
}
