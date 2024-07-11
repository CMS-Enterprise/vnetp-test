import { Component, Input } from '@angular/core';
import { AciRuntime, AciRuntimeJobCreateDtoTypeEnum, EndpointGroup, V1RuntimeDataAciRuntimeService, Vlan } from '../../../../client';
import { RuntimeDataService } from '../../services/runtime-data.service';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from '../../services/datacenter-context.service';
import { ActivatedRoute } from '@angular/router';
import { LiteTableConfig } from '../../common/lite-table/lite-table.component';

@Component({
  selector: 'app-aci-runtime',
  templateUrl: './aci-runtime.component.html',
  styleUrl: './aci-runtime.component.css',
})
export class AciRuntimeComponent {
  @Input() vlan: Vlan | undefined;
  @Input() endpointGroup: EndpointGroup | undefined;
  mode: string;
  aciRuntimeData: AciRuntime[];
  isRefreshingRuntimeData = false;
  datacenterId: string;
  tenantId: string;
  currentDatacenterSubscription: Subscription;
  jobStatus: string;
  lastRefreshed: string;

  config: LiteTableConfig<AciRuntime> = {
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Endpoint Name', property: 'contName' },
      { name: 'Mac Address', property: 'macAddress' },
      { name: 'Address', property: 'addr' },
      { name: 'Learning Source', property: 'lcC' },
    ],
  };

  constructor(
    private aciRuntimeService: V1RuntimeDataAciRuntimeService,
    private runtimeDataService: RuntimeDataService,
    private datacenterService: DatacenterContextService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.datacenterId = cd.id;
        this.getAciRuntimeData();
      }
    });

    this.route.paramMap.subscribe(params => {
      this.tenantId = params.get('tenantId');
    });
  }

  getAciRuntimeData(): void {
    const query = this.vlan ? `vlanId||eq||${this.vlan.id}` : `endpointGroupId||eq||${this.endpointGroup.id}`;

    this.aciRuntimeService
      .getManyAciRuntime({
        filter: [query],
      })
      .subscribe(data => {
        this.aciRuntimeData = data;
        this.lastRefreshed = this.runtimeDataService.calculateTimeDifference(data[0]?.runtimeDataLastRefreshed);
      });
  }

  refreshRuntimeData(): void {
    if (this.isRecentlyRefreshed() || this.isRefreshingRuntimeData) {
      return;
    }

    this.isRefreshingRuntimeData = true;

    this.aciRuntimeService
      .createRuntimeDataJobAciRuntime({
        aciRuntimeJobCreateDto: {
          type: AciRuntimeJobCreateDtoTypeEnum.AciRuntime,
          vlanId: this.vlan?.id,
          endpointGroupId: this.endpointGroup?.id,
          datacenterId: this.datacenterId,
        },
      })
      .subscribe(job => {
        let status = '';
        this.runtimeDataService.pollJobStatus(job.id).subscribe({
          next: towerJobDto => {
            status = towerJobDto.status;
          },
          error: () => {
            status = 'error';
            this.isRefreshingRuntimeData = false;
            this.jobStatus = status;
          },
          complete: () => {
            this.isRefreshingRuntimeData = false;
            if (status === 'successful') {
              this.getAciRuntimeData();
            }
            this.jobStatus = status;
          },
        });
      });
  }

  isRecentlyRefreshed(): boolean {
    return this.runtimeDataService.isRecentlyRefreshed(this.aciRuntimeData?.[0]?.runtimeDataLastRefreshed);
  }

  getTooltipMessage(status: string): string {
    switch (status) {
      case 'failed':
        return 'Job Status: Failed';
      case 'running':
        return 'Job Status: Timeout';
      case 'error':
        return 'An error occurred during polling';
      default:
        return status;
    }
  }
}
