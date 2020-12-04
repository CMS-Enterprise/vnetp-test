import { Component, OnInit, Output, TemplateRef, ViewChild, EventEmitter } from '@angular/core';
import { ActifioHostDto, V1ActifioGmHostsService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TableConfig } from 'src/app/common/table/table.component';

@Component({
  selector: 'app-select-vcenter',
  templateUrl: './select-vcenter.component.html',
  styles: ['.loading { display: flex; flex-direction: column; align-items: center'],
})
export class SelectVCenterComponent implements OnInit {
  @ViewChild('selectVCenterTemplate', { static: false }) selectVCenterTemplate: TemplateRef<any>;
  @ViewChild('selectVCenterToggleTemplate', { static: false }) selectVCenterToggleTemplate: TemplateRef<any>;

  @Output() vcenterSelected = new EventEmitter<number>();

  public config: TableConfig<ActifioHostDto> = {
    description: 'List of vCenters',
    columns: [
      { name: '', template: () => this.selectVCenterToggleTemplate },
      { name: 'Name', property: 'name' },
      { name: 'IP Address', property: 'ipAddress' },
    ],
  };
  public vCenters: ActifioHostDto[] = [];
  public isLoading = false;
  public selectedVCenterId: number;

  constructor(private agmHostService: V1ActifioGmHostsService, private ngx: NgxSmartModalService) {}

  ngOnInit(): void {
    this.loadVCenters();
  }

  public onCancel(): void {
    this.ngx.close('vmDiscoveryModal');
  }

  public selectVCenter(): void {
    if (!this.selectedVCenterId) {
      return;
    }
    this.vcenterSelected.emit(this.selectedVCenterId);
  }

  private loadVCenters(): void {
    this.isLoading = true;
    this.agmHostService.v1ActifioGmHostsGet().subscribe(
      data => {
        this.vCenters = data;
        this.isLoading = false;
      },
      () => {
        this.vCenters = [];
        this.isLoading = false;
      },
    );
  }
}
