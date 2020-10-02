import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActifioTemplateDto, V1AgmTemplatesService } from 'api_client';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html',
})
export class TemplateListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('actionsTemplate', { static: false }) actionsTemplate: TemplateRef<any>;

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
      {
        name: '',
        template: () => this.actionsTemplate,
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

  public deleteTemplate(template: ActifioTemplateDto): void {
    const deleteFunction = () => {
      this.agmTemplateService.v1AgmTemplatesIdDelete({ id: template.id }).subscribe(() => {
        this.loadTemplates();
      });
    };

    this.openConfirmationModal(
      new YesNoModalDto(`Delete SLA Template?`, `Do you want to delete SLA Template "${template.name}"?`),
      deleteFunction,
    );
  }

  private openConfirmationModal(modalDto: YesNoModalDto, deleteFunction: () => void) {
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (data && data.modalYes) {
        deleteFunction();
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  private subscribeToTemplateModal(): Subscription {
    return this.ngx.getModal('templateModal').onCloseFinished.subscribe(() => {
      this.loadTemplates();
      this.ngx.resetModalData('templateModal');
    });
  }
}
