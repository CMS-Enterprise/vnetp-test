import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-virtual-server-card',
  templateUrl: './virtual-server-card.component.html',
  styleUrls: ['./virtual-server-card.component.css'],
})
export class VirtualServerCardComponent implements OnInit {
  expanded = false;

  @Input() virtualServer: any;
  virtualServerName: string;
  virtualServerAddress: string;
  @Output() expandedChange = new EventEmitter<boolean>();
  poolName: string;
  members: any;
  virtualServerStatus: any;
  pool: any;
  poolStats;
  virtualServerTableData;
  poolStatus: any;
  poolTableData;
  expiredCertsWarning = false;

  showScrollFade = true;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.virtualServerName = this.virtualServer?.name;

    if (this.virtualServer?.destination) {
      const addressSplit = this.virtualServer?.destination.split('/');
      if (addressSplit.length > 2) {
        this.virtualServerAddress = addressSplit[2];
      }
    }

    this.poolName = this.virtualServer?.poolReference?.items?.name;
    this.members = this.virtualServer?.poolReference?.items?.membersReference?.items;
    this.virtualServerStatus = this.getStatusClass(
      this.virtualServer?.stats?.nestedStats?.entries?.['status.availabilityState'],
      this.virtualServer?.stats?.nestedStats?.entries?.['status.enabledState'],
    );
    this.pool = this.virtualServer?.poolReference?.items;
    this.poolStats = this.virtualServer?.poolReference?.stats?.nestedStats?.entries;
    this.virtualServerTableData = this.getVirtualServerTableData(this.virtualServer);
    this.poolStatus = this.getStatusClass(this.poolStats?.['status.availabilityState'], this.poolStats?.['status.enabledState']);
    this.poolTableData = this.getPoolTableData(this.poolStats);
    this.checkCertificateExpiry();
  }

  checkCertificateExpiry(): void {
    const certs = this.virtualServer?.certsReference;
    const currentDate = Math.floor(Date.now() / 1000); // Current date in seconds
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60; // 30 days in seconds

    if (certs) {
      this.expiredCertsWarning = certs.some(cert => {
        const expirationDate = cert.expirationDate;
        return expirationDate <= currentDate || expirationDate <= currentDate + thirtyDaysInSeconds;
      });
    }
  }

  checkScroll(event: any): void {
    const target = event?.target;
    const maxScroll = target?.scrollHeight - target?.offsetHeight; // Maximum scrollable height
    const currentScroll = target?.scrollTop; // Current scroll position

    // Check if the current scroll position is close to the maximum scrollable height
    this.showScrollFade = currentScroll < maxScroll - 5; // '5' is a buffer, adjust as needed
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
    this.expandedChange.emit(this.expanded);
    // strange bug when quickly closing and opening the card, status wont render in the table
    // this fixes it
    this.cdr.detectChanges();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.toggleExpanded();
    }
  }

  getStatusClass(availablityState?: any, enabledState?: any): string {
    if (availablityState?.description === 'available' && enabledState?.description === 'enabled') {
      return 'text-success';
    }
    if (availablityState?.description === 'available' && enabledState?.description === 'disabled') {
      return 'text-dark';
    }
    if (availablityState?.description === 'offline') {
      return 'text-danger';
    }

    return 'text-primary';
  }

  getVirtualServerTableData(virtualServer) {
    const stats = virtualServer?.stats?.nestedStats?.entries;
    const bitsInRaw = stats?.['clientside.bitsIn']?.value;
    const bitsOutRaw = stats?.['clientside.bitsOut']?.value;
    const packetsInRaw = stats?.['clientside.pktsIn']?.value;
    const packetsOutRaw = stats?.['clientside.pktsOut']?.value;
    const currentConnectionsRaw = stats?.['clientside.curConns']?.value;
    const maxConnectionsRaw = stats?.['clientside.maxConns']?.value;
    const totalConnectionsRaw = stats?.['clientside.totConns']?.value;
    const totalRequestsRaw = stats?.totRequests?.value;
    const fiveSecAvgUsageRatioRaw = stats?.fiveSecAvgUsageRatio?.value;
    const fiveMinAvgUsageRatioRaw = stats?.fiveMinAvgUsageRatio?.value;
    const oneMinAvgUsageRatioRaw = stats?.oneMinAvgUsageRatio?.value;

    const bitsIn = this.convertBitsToHighestUnit(bitsInRaw);
    const bitsOut = this.convertBitsToHighestUnit(bitsOutRaw);
    const packetsIn = this.convertToHighestDenominator(packetsInRaw);
    const packetsOut = this.convertToHighestDenominator(packetsOutRaw);
    const currentConnections = this.convertToHighestDenominator(currentConnectionsRaw);
    const maxConnections = this.convertToHighestDenominator(maxConnectionsRaw);
    const totalConnections = this.convertToHighestDenominator(totalConnectionsRaw);
    const totalRequests = this.convertToHighestDenominator(totalRequestsRaw);
    const fiveSecAvgUsageRatio = `${fiveSecAvgUsageRatioRaw}%`;
    const fiveMinAvgUsageRatio = `${fiveMinAvgUsageRatioRaw}%`;
    const oneMinAvgUsageRatio = `${oneMinAvgUsageRatioRaw}%`;

    return {
      bitsIn,
      bitsOut,
      packetsIn,
      packetsOut,
      currentConnections,
      maxConnections,
      totalConnections,
      totalRequests,
      fiveSecAvgUsageRatio,
      fiveMinAvgUsageRatio,
      oneMinAvgUsageRatio,
    };
  }

  public getPoolTableData(poolStats) {
    const bitsInRaw = poolStats?.['serverside.bitsIn']?.value;
    const bitsOutRaw = poolStats?.['serverside.bitsOut']?.value;
    const packetsInRaw = poolStats?.['serverside.pktsIn']?.value;
    const packetsOutRaw = poolStats?.['serverside.pktsOut']?.value;
    const currentConnectionsRaw = poolStats?.['serverside.curConns']?.value;
    const maxConnectionsRaw = poolStats?.['serverside.maxConns']?.value;
    const totalConnectionsRaw = poolStats?.['serverside.totConns']?.value;
    const totalRequestsRaw = poolStats?.totRequests?.value;
    const maxAgeRaw = poolStats?.['connq.ageMax']?.value;
    const maxQueueDepthRaw = poolStats?.['connq.depth']?.value;

    const bitsIn = this.convertBitsToHighestUnit(bitsInRaw);
    const bitsOut = this.convertBitsToHighestUnit(bitsOutRaw);
    const packetsIn = this.convertToHighestDenominator(packetsInRaw);
    const packetsOut = this.convertToHighestDenominator(packetsOutRaw);
    const currentConnections = this.convertToHighestDenominator(currentConnectionsRaw);
    const maxConnections = this.convertToHighestDenominator(maxConnectionsRaw);
    const totalConnections = this.convertToHighestDenominator(totalConnectionsRaw);
    const totalRequests = this.convertToHighestDenominator(totalRequestsRaw);
    const maxAge = maxAgeRaw;
    const depth = maxQueueDepthRaw;

    return {
      bitsIn,
      bitsOut,
      packetsIn,
      packetsOut,
      currentConnections,
      maxConnections,
      totalConnections,
      totalRequests,
      maxAge,
      depth,
    };
  }

  public convertBitsToHighestUnit(bits: number): string {
    if (bits === undefined || bits === null) {
      bits = 0;
    }

    const units: string[] = ['bits', 'bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let currentValue = bits; // Start with bits
    let currentIndex = 0; // Index of the current unit in units array

    while (currentIndex < units.length - 1 && ((currentIndex === 0 && currentValue >= 8) || currentValue >= 1024)) {
      if (currentIndex === 0) {
        currentValue /= 8; // Convert bits to bytes
      } else {
        currentValue /= 1024; // Convert to higher unit
      }
      currentIndex++;
    }

    // Format the value to two decimal places. Adjust this as needed for more or fewer decimal places.
    const formattedValue = parseFloat(currentValue.toFixed(2));

    return `${formattedValue}${units[currentIndex]}`;
  }

  public convertToHighestDenominator(value: number): string {
    if (value === undefined || value === null) {
      value = 0;
    }
    // Define the suffixes for the denominations
    const denominations = ['', 'K', 'M', 'B', 'T', 'P', 'E'];
    let index = 0; // Start from the first denomination ('', meaning no suffix)

    // Iterate to find the highest denomination for which the value is at least 1
    while (value >= 1000 && index < denominations.length - 1) {
      value /= 1000;
      index++;
    }

    // Format the value to two decimal places and append the appropriate suffix
    // Adjust the toFixed() argument as needed for more or fewer decimal places
    return `${parseFloat(value.toFixed(2))}${denominations[index]}`;
  }
}
