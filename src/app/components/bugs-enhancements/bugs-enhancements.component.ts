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
  @ViewChild('mailUserTemplate') mailUserTemplate: TemplateRef<any>;
  @ViewChild('mailComponentTemplate') mailComponentTemplate: TemplateRef<any>;

  mails;

  private dataChanges: Subscription;

  public perPage = 10;
  public tableComponentDto = new TableComponentDto();
  public isLoading = false;

  public config: TableConfig<any> = {
    description: 'Bugs/Enhancements',
    columns: [
      { name: 'Status', property: 'status' },
      { name: 'Mail Body', template: () => this.mailBodyTemplate },
      { name: 'Requesting User', property: 'user' },
      { name: 'Mail Type', property: 'component' },
      { name: 'Mail Type', property: 'mailType' },
      { name: 'Timestamp', property: 'timestamp' },
    ],
  };

  constructor(private ngx: NgxSmartModalService, private mailService: V1MailService) {}
  public getMails(event?): void {
    this.isLoading = true;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 10;
    } else {
      this.tableComponentDto.perPage = this.perPage;
    }
    this.mailService.getMailsMail({ page: this.tableComponentDto.page, perPage: this.tableComponentDto.perPage }).subscribe(
      data => {
        this.mails = data;
      },
      () => {
        this.mails = [];
      },
      () => {
        this.isLoading = false;
      },
    );
  }

  ngOnInit() {
    this.getMails();
  }
  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getMails(event);
  }
}
