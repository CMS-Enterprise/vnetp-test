import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilitiesService } from 'client/api/utilities.service';
import { Router } from '@angular/router';
import { PathResult, Tenant, V2AppCentricTenantsService } from '../../../../../../../client';

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
  tenantVersion: number;

  // API response data
  connectivityResult: PathResult | null = null;

  // Protocol options for the form
  protocolOptions = ['tcp', 'udp', 'icmp'];

  constructor(
    private fb: FormBuilder,
    private utilitiesService: UtilitiesService,
    private router: Router,
    private tenantService: V2AppCentricTenantsService,
  ) {}

  ngOnInit(): void {
    // Extract tenant ID from the URL
    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      this.tenantId = match[0].split('/')[2];
      this.tenantService.getOneTenant({ id: this.tenantId }).subscribe((tenant: Tenant) => {
        this.tenantVersion = tenant.version;
      });
    }

    this.connectivityForm = this.fb.group({
      generatedConfigIdentifier: ['connectivity-test-' + Date.now(), Validators.required],
      sourceEndpointIp: ['', [Validators.required, Validators.pattern('^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$')]],
      sourceEndpointPort: [null],
      destinationEndpointIp: ['', [Validators.required, Validators.pattern('^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$')]],
      destinationEndpointPort: ['', [Validators.pattern('^\\d+$')]],
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
      tenantVersion: this.tenantVersion,
    };

    this.utilitiesService.generateConnectivityReportUtilities({ endpointConnectivityQuery: query }).subscribe({
      next: (result: PathResult) => {
        this.isLoading = false;
        this.connectivityResult = result;
      },
      error: err => {
        this.isLoading = false;
        this.error = err.message || 'An error occurred while testing connectivity';
      },
    });
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
}
