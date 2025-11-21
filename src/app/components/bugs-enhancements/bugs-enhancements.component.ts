/* eslint-disable */
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Datacenter, EndpointGroup, V1MailService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { forkJoin, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { TableComponentDto } from '../../models/other/table-component-dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bugs-enhancements',
  templateUrl: './bugs-enhancements.component.html',
})
export class BugsEnhancementsComponent implements OnInit {
  @ViewChild('mailBodyTemplate') mailBodyTemplate: TemplateRef<any>;
  mails = { data: [] };

  private dataChanges: Subscription;

  public perPage = 10;
  public tableComponentDto = new TableComponentDto();

  public config: TableConfig<any> = {
    description: 'Audit Log',
    columns: [
      { name: 'Status', property: 'status' },
      { name: 'Mail Body', template: () => this.mailBodyTemplate },
      { name: 'Mail Type', property: 'mailType' },
    ],
  };

  constructor(private ngx: NgxSmartModalService, private mailService: V1MailService) {}
  public getMails(event?): void {
    this.mailService.getMailsMail().subscribe(data => {
      this.mails.data = data;
    });
  }

  ngOnInit() {
    this.getMails();
  }
  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getMails(event);
  }
}
