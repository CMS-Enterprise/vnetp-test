import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Message, V3GlobalMessagesService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-global-messages',
  templateUrl: './global-messages.component.html',
  styleUrls: ['./global-messages.component.scss'],
})
export class GlobalMessagesComponent implements OnInit {
  public globalMessageModalSubscription: Subscription;

  isLoading = false;
  ModalMode = ModalMode;

  public searchColumns: SearchColumnConfig[] = [{ displayName: 'Message Type', propertyName: 'messageType' }];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  public config: TableConfig<any> = {
    description: 'messages',
    columns: [
      { name: 'Message Type', property: 'messageType' },
      { name: 'Message', property: 'description' },
      { name: 'Tenant name', property: 'tenantName' },
      { name: '', template: () => this.actionsTemplate },
    ],
    hideAdvancedSearch: true,
  };
  perPage = 20;

  messages;
  public tableComponentDto = new TableComponentDto();

  constructor(private globalMessagesService: V3GlobalMessagesService, public ngx: NgxSmartModalService) {}

  ngOnInit(): void {
    this.getGlobalMessages();
  }

  public subscribeToGlobalMessagesModal(): void {
    this.globalMessageModalSubscription = this.ngx.getModal('globalMessagesModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('globalMessagesModal');
      this.globalMessageModalSubscription.unsubscribe();
      this.getGlobalMessages();
    });
  }

  public openGlobalMessagesModal(modalMode?): void {
    const dto: any = {};
    dto.ModalMode = modalMode;
    this.subscribeToGlobalMessagesModal();
    this.ngx.setModalData(dto, 'globalMessagesModal');
    this.ngx.getModal('globalMessagesModal').open();
  }

  public getGlobalMessages(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      this.tableComponentDto.searchText = searchText;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        eventParams = `${propertyName}||eq||${searchText}`;
      }
    } else {
      this.tableComponentDto.searchText = undefined;
    }
    this.globalMessagesService
      .getManyMessage({ filter: [eventParams], page: this.tableComponentDto.page, perPage: this.tableComponentDto.perPage })
      .subscribe(
        data => {
          this.messages = data;
          this.messages.data.map(message => {
            message.tenantName = message.tenantName.replace(/['"]+/g, '').split('_').slice(0, -1).toString().replaceAll(',', '_');
          });
        },
        () => {
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getGlobalMessages(event);
  }

  public deleteEntry(message: Message): void {
    // evaluate length of description and strip off characters if necessary to prevent UI bugs
    let newDescription = message.description;
    if (message.description.length >= 30) {
      newDescription = message.description.slice(0, 29) + '...';
    }

    const dto = new YesNoModalDto('Delete Message?', `"${newDescription}"`);
    const onConfirm = () => {
      this.globalMessagesService.deleteOneMessage({ id: message.id }).subscribe(() => {
        this.getGlobalMessages();
      });
    };

    const onClose = () => {
      this.getGlobalMessages();
    };
    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, onConfirm, onClose);
  }
}
