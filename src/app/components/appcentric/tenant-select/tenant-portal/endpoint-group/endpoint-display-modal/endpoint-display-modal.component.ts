import { Component, Input, OnInit } from '@angular/core';
import { Endpoint } from '../../../../../../../../client/model/endpoint';
import { IpAddress } from '../../../../../../../../client/model/ipAddress';
import { NgxSmartModalService } from 'ngx-smart-modal';

export interface ExtendedEndpoint extends Endpoint {
  epgName?: string;
}

// Define a type for the data that will be displayed in the template
interface DisplayEndpoint {
  macAddress?: string;
  epgName?: string;
  ipAddresses?: Array<IpAddress>;
  isExpanded: boolean; // To manage collapsible state
}

@Component({
  selector: 'app-endpoint-display-modal',
  templateUrl: './endpoint-display-modal.component.html',
  styleUrls: ['./endpoint-display-modal.component.scss'],
})
export class EndpointDisplayModalComponent implements OnInit {
  @Input() modalId = 'endpointDisplayModal';

  // This will hold the raw data from the modal service
  private rawEndpoints: (Endpoint | ExtendedEndpoint)[] = [];
  public displayData: DisplayEndpoint[] = [];

  constructor(private ngxSmartModalService: NgxSmartModalService) {}

  ngOnInit(): void {
    // Attempt to get the modal instance. It might not be available if this.modalId is incorrect
    // or if the modal component itself hasn't been fully registered with the service yet.
    try {
      const modal = this.ngxSmartModalService.getModal(this.modalId);

      modal.onOpen.subscribe(() => {
        const data = modal.getData();
        if (Array.isArray(data)) {
          this.rawEndpoints = data;
        } else {
          this.rawEndpoints = []; // Ensure it's an array if data is unexpected or not set
        }
        this.processEndpoints();
      });

      // Optional: Clear data when modal closes to prevent stale data on reopen if onOpen doesn't fire as expected
      modal.onClose.subscribe(() => {
        this.rawEndpoints = [];
        this.displayData = [];
      });
      modal.onDismiss.subscribe(() => {
        this.rawEndpoints = [];
        this.displayData = [];
      });
    } catch (e) {
      console.error(`Modal with ID '${this.modalId}' not found during OnInit. Ensure it is correctly registered and the ID matches.`, e);
    }
    // Initialize displayData to ensure it's always an array
    this.displayData = [];
  }

  processEndpoints(): void {
    if (!this.rawEndpoints || this.rawEndpoints.length === 0) {
      this.displayData = [];
      return;
    }
    this.displayData = this.rawEndpoints.map(ep => {
      const displayEp: DisplayEndpoint = {
        macAddress: ep.macAddress,
        ipAddresses: ep.ipAddresses, // This will be undefined if not in the source data
        isExpanded: true, // Expanded by default
      };
      if ('epgName' in ep && ep.epgName) {
        displayEp.epgName = (ep as ExtendedEndpoint).epgName;
      }
      return displayEp;
    });
  }

  toggleIpAddresses(endpoint: DisplayEndpoint): void {
    endpoint.isExpanded = !endpoint.isExpanded;
  }
}
