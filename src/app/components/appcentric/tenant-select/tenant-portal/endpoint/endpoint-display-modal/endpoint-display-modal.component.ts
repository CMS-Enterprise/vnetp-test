import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { Endpoint } from '../../../../../../../../client/model/endpoint';
import { EndpointIpAddress } from '../../../../../../../../client/model/endpointIpAddress';
import { NgxSmartModalService } from 'ngx-smart-modal';

// Removed ExtendedEndpoint interface

// Define a type for the data that will be displayed in the template for a single endpoint's details
export interface ModalDisplayEndpoint {
  macAddress?: string;
  ipAddresses?: EndpointIpAddress[]; // Assuming IpAddress has 'address' field
  isIpListExpanded: boolean;
}

// Define a type for displaying EPGs with their nested endpoints in ESG context
export interface EsgModalDisplayData {
  epgName: string;
  endpoints: ModalDisplayEndpoint[];
  isEpgExpanded: boolean;
}

interface ModalInput {
  data: any; // Can be EsgModalDisplayData[] or ModalDisplayEndpoint[] or raw EPG/ESG data
  context: 'epg' | 'esg';
}

@Component({
  selector: 'app-endpoint-display-modal',
  templateUrl: './endpoint-display-modal.component.html',
  styleUrls: ['./endpoint-display-modal.component.scss'],
})
export class EndpointDisplayModalComponent implements OnInit, AfterViewInit {
  @Input() modalId = 'endpointDisplayModal';

  public rawModalInput: ModalInput | null = null;
  public processedModalData: EsgModalDisplayData[] | ModalDisplayEndpoint[] = [];
  public displayContext: 'epg' | 'esg' = 'epg'; // Default, will be overwritten

  constructor(private ngxSmartModalService: NgxSmartModalService) {}

  ngOnInit(): void {
    this.processedModalData = [];
  }

  ngAfterViewInit(): void {
    try {
      const modal = this.ngxSmartModalService.getModal(this.modalId);

      modal.onOpen.subscribe(() => {
        const modalInput = modal.getData() as ModalInput;
        if (modalInput && modalInput.data && modalInput.context) {
          this.rawModalInput = modalInput;
          this.displayContext = modalInput.context;
        } else {
          // Handle cases where data might not be in the expected {data, context} format
          // For EPG context, the old way was to pass Endpoint[] directly
          const directData = modal.getData();
          if (Array.isArray(directData) && directData.every(item => 'macAddress' in item)) {
            // Likely old EPG data format
            this.rawModalInput = { data: directData, context: 'epg' };
            this.displayContext = 'epg';
          } else {
            this.rawModalInput = null;
            this.processedModalData = [];
            console.error('Modal data is not in the expected format or is missing.', modalInput);
            return;
          }
        }
        this.processInputData();
      });

      modal.onClose.subscribe(() => {
        this.rawModalInput = null;
        this.processedModalData = [];
      });
      modal.onDismiss.subscribe(() => {
        this.rawModalInput = null;
        this.processedModalData = [];
      });
    } catch (e) {
      console.error(`Modal '${this.modalId}' not found in ngAfterViewInit. Check ID and registration.`, e);
    }
  }

  processInputData(): void {
    if (!this.rawModalInput || !this.rawModalInput.data) {
      this.processedModalData = [];
      return;
    }

    const { data, context } = this.rawModalInput;

    if (context === 'esg') {
      // Assuming data is already EsgModalDisplayData[] pre-processed by the caller
      this.processedModalData = data as EsgModalDisplayData[];
    } else if (context === 'epg') {
      // Assuming data is Endpoint[] (or ExtendedEndpoint-like)
      const endpoints = data as Endpoint[]; // Endpoint type from client
      this.processedModalData = endpoints.map(
        ep =>
          ({
            macAddress: ep.macAddress,
            ipAddresses: ep.ipAddresses,
            isIpListExpanded: true, // Default
            // epgName is not stored here for 'epg' context as it's redundant in the flat list
          } as ModalDisplayEndpoint),
      );
    } else {
      this.processedModalData = [];
    }
  }

  toggleIpAddresses(endpoint: ModalDisplayEndpoint): void {
    endpoint.isIpListExpanded = !endpoint.isIpListExpanded;
  }

  toggleEpgExpansion(epgData: EsgModalDisplayData): void {
    epgData.isEpgExpanded = !epgData.isEpgExpanded;
  }
}
