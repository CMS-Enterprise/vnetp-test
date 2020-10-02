import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActifioTemplateDto, V1AgmTemplatesService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html',
})
export class TemplateListComponent implements OnInit, OnDestroy, AfterViewInit {
  public config = {
    description: 'List of SLA Templates',
    columns: [
      {
        name: 'Name',
        property: 'name',
      },
      {
        name: 'Description',
        property: 'description',
      },
    ],
  };
  public isLoading = false;
  public templates: ActifioTemplateDto[] = [];

  public ModalMode = ModalMode;

  private subscriptions: Subscription[] = [];

  constructor(private agmTemplateService: V1AgmTemplatesService, private ngx: NgxSmartModalService) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  ngAfterViewInit(): void {
    const templateModalSubscription = this.subscribeToTemplateModal();
    this.subscriptions.push(templateModalSubscription);
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe(this.subscriptions);
  }

  public openTemplateModal(template?: ActifioTemplateDto): void {
    this.ngx.setModalData(template, 'templateModal');
    this.ngx.open('templateModal');
  }

  public loadTemplates(): void {
    this.isLoading = true;
    this.agmTemplateService.v1AgmTemplatesGet().subscribe(data => {
      this.templates = data;
      this.isLoading = false;
    });
  }

  private subscribeToTemplateModal(): Subscription {
    return this.ngx.getModal('templateModal').onCloseFinished.subscribe(() => {
      this.loadTemplates();
      this.ngx.resetModalData('templateModal');
    });
  }
}
