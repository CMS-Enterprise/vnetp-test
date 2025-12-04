/* eslint-disable */
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { V1MailService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from '../../models/other/table-component-dto';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { EntityService } from 'src/app/services/entity.service';
import { TableContextService } from 'src/app/services/table-context.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bugs-enhancements',
  templateUrl: './bugs-enhancements.component.html',
  //   styleUrls: ['./bugs-enhancements.component.scss']
})
export class BugsEnhancementsComponent implements OnInit {
  @ViewChild('mailBodyTemplate') mailBodyTemplate: TemplateRef<any>;
  @ViewChild('mailUserTemplate') mailUserTemplate: TemplateRef<any>;
  @ViewChild('mailComponentTemplate') mailComponentTemplate: TemplateRef<any>;
  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  mails;
  selectedMail;
  private bugsEnhancementsModalSubscription: Subscription;
  public perPage = 10;
  public tableComponentDto = new TableComponentDto();
  public isLoading = false;

  public objectSearchColumns: SearchColumnConfig[] = [{ displayName: 'Status', propertyName: 'status' }];

  public config: TableConfig<any> = {
    description: 'Bugs/Enhancements',
    columns: [
      { name: 'Status', property: 'status' },
      { name: 'Mail Body', template: () => this.mailBodyTemplate },
      { name: 'Requesting User', property: 'user' },
      { name: 'Component', property: 'component' },
      { name: 'Mail Type', property: 'mailType' },
      { name: 'Timestamp', property: 'timestamp' },
      { name: '', template: () => this.actionsTemplate },
    ],
    hideSearchBar: true,
    hideAdvancedSearch: true,
  };

  constructor(
    private tableContextService: TableContextService,
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private mailService: V1MailService,
  ) {}
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

  public deleteMail(mail): void {
    mail.name = mail.timestamp;
    this.entityService.deleteEntity(mail, {
      entityName: 'Mail',
      delete$: this.mailService.deleteMailMail({ mailId: mail.id }),
      softDelete$: this.mailService.deleteMailMail({ mailId: mail.id }),
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults, searchString } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults && !searchString) {
          this.getMails(this.tableComponentDto);
        } else {
          this.getMails();
        }
      },
    });
  }

  public openDetailedModal(mail: any): void {
    // const properties = Object.keys(mail.mailBody);
    // let newProperties = [];
    // properties.map(property => {
    //   newProperties.push(
    //     property.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
    //       return str.toUpperCase();
    //     }),
    //   );
    //   console.log('newProperties', newProperties);
    // });
    // const newMailObject = {};
    // newProperties.map(newProp => {
    //   newMailObject[newProp] = Object.values(mail.mailBody).map(value => {
    //     return value;
    //   });
    // });
    // console.log('newMailObject', newMailObject);
    // console.log('newProperties',newProperties)
    // for (String w : "camelValue".split("(?<!(^|[A-Z]))(?=[A-Z])|(?<!^)(?=[A-Z][a-z])")) {
    //     System.out.println(w);
    // }
    this.subscribeToBugsEnhancementsModal();
    this.selectedMail = { data: [mail], page: 1, pageCount: 1, count: 1, total: 1 };
    this.ngx.getModal('bugsEnhancementsViewModal').open();
  }

  subscribeToBugsEnhancementsModal() {
    this.bugsEnhancementsModalSubscription = this.ngx.getModal('bugsEnhancementsViewModal').onCloseFinished.subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults, searchString } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults && !searchString) {
        this.getMails(this.tableComponentDto);
      } else {
        this.getMails();
      }
      this.ngx.resetModalData('bugsEnhancementsViewModal');
      this.bugsEnhancementsModalSubscription.unsubscribe();
    });
  }
}
