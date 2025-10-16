import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Message, GetManyMessageResponseDto, V3GlobalMessagesService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-global-messages',
  templateUrl: './global-messages.component.html',
  styleUrls: ['./global-messages.component.scss'],
  standalone: false,
})
export class GlobalMessagesComponent implements OnInit {
  public globalMessageModalSubscription: Subscription;

  ModalMode = ModalMode;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  public config: TableConfig<any> = {
    description: 'messages',
    columns: [
      { name: 'Message', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
    hideAdvancedSearch: true,
    hideSearchBar: true,
  };
  perPage = 20;
  messages: GetManyMessageResponseDto;

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
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 10;
    } else {
      this.tableComponentDto.perPage = this.perPage;
    }

    this.globalMessagesService
      .getManyMessage({ page: this.tableComponentDto.page, perPage: this.tableComponentDto.perPage })
      .subscribe(data => {
        this.messages = data;
      });
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
