import { Component, OnInit } from '@angular/core';
import { V1SelfServiceService } from 'client/api/v1SelfService.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TableConfig } from 'src/app/common/table/table.component';
import { ModalMode } from 'src/app/models/other/modal-mode';

@Component({
  selector: 'app-self-service',
  templateUrl: './self-service.component.html',
})
export class SelfServiceComponent implements OnInit {
  public config: TableConfig<any> = {
    description: 'Self Services',
    columns: [
      { name: 'Id', property: 'id' },
      { name: 'Raw XML Config', property: 'rawXMLConfig' },
    ],
  };

  public selfServices;

  constructor(private selfServiceService: V1SelfServiceService, private ngx: NgxSmartModalService) {}

  public getSelfServices() {
    this.selfServiceService.getSelfServicesSelfService().subscribe(data => {
      this.selfServices = data;
    });
  }

  public openSelfServiceModal() {
    this.ngx.getModal('selfServiceModal').open();
  }

  ngOnInit(): void {
    console.log('im initialized!');
    this.getSelfServices();
  }
}
