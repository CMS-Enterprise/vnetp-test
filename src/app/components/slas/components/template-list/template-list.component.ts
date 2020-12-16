import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActifioTemplateDto, V1ActifioGmTemplatesService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

interface TemplateView extends ActifioTemplateDto {
  snapshotPolicyTimeWindow: Observable<string>;
}

@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html',
})
export class TemplateListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('snapshotPolicyTemplate') snapshotPolicyTemplate: TemplateRef<any>;
  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

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
        name: 'Daily Backup',
        template: () => this.snapshotPolicyTemplate,
      },
      {
        name: '',
        template: () => this.actionsTemplate,
      },
    ],
  };
  public isLoading = false;
  public templates: TemplateView[] = [];

  public ModalMode = ModalMode;

  private subscriptions: Subscription[] = [];

  constructor(private agmTemplateService: V1ActifioGmTemplatesService, private ngx: NgxSmartModalService) {}

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
    this.ngx.getModal('templateModal').open();
  }

  public loadTemplates(): void {
    this.isLoading = true;
    this.agmTemplateService.v1ActifioGmTemplatesGet({ limit: 100, offset: 0 }).subscribe(data => {
      this.templates = data.map(d => {
        return {
          ...d,
          description: d.description || '--',
          snapshotPolicyTimeWindow: this.getSnapshotPolicyTimeWindow(d.id),
        };
      });
      this.isLoading = false;
    });
  }

  public deleteTemplate(template: ActifioTemplateDto): void {
    const deleteFunction = () => {
      this.agmTemplateService.v1ActifioGmTemplatesIdDelete({ id: template.id }).subscribe(() => {
        this.loadTemplates();
      });
    };
    const dto = new YesNoModalDto(
      'Delete SLA Template',
      `Do you want to delete SLA Template "${template.name}"?`,
      'Delete SLA Template',
      'Cancel',
      'danger',
    );
    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, deleteFunction);
  }

  private getSnapshotPolicyTimeWindow(templateId: string): Observable<string> {
    return this.agmTemplateService.v1ActifioGmTemplatesIdPolicyGet({ id: templateId, isSnapshot: true, limit: 1, offset: 0 }).pipe(
      map(policies => (policies.length > 0 ? policies[0] : null)),
      map(snapshotPolicy => {
        if (!snapshotPolicy) {
          return '--';
        }
        const { startTime, endTime } = snapshotPolicy;
        return `${this.convertSecondsToTime(startTime)} to ${this.convertSecondsToTime(endTime)}`;
      }),
    );
  }

  private convertSecondsToTime(seconds = 0): string {
    const hour = `${seconds / 3600}`.padStart(2, '0');
    return hour + ':00';
  }

  private subscribeToTemplateModal(): Subscription {
    return this.ngx.getModal('templateModal').onCloseFinished.subscribe(() => {
      this.loadTemplates();
      this.ngx.resetModalData('templateModal');
    });
  }
}
