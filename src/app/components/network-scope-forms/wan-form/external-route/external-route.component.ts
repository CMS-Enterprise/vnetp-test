import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TableConfig } from '../../../../common/table/table.component';
import { ExternalRoute } from '../../../../../../client/model/externalRoute';
import { GetManyExternalRouteResponseDto } from '../../../../../../client/model/getManyExternalRouteResponseDto';
import { TableComponentDto } from '../../../../models/other/table-component-dto';
// eslint-disable-next-line max-len
import { V1NetworkScopeFormsWanFormExternalRouteService } from '../../../../../../client/api/v1NetworkScopeFormsWanFormExternalRoute.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalMode } from '../../../../models/other/modal-mode';
import { SearchColumnConfig } from '../../../../common/search-bar/search-bar.component';
import { WanForm } from '../../../../../../client/model/wanForm';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TableContextService } from '../../../../services/table-context.service';
import { Subscription } from 'rxjs';
import { ExternalRouteModalDto } from '../../../../models/network-scope-forms/external-route-modal.dto';
import { V1NetworkScopeFormsWanFormService } from '../../../../../../client/api/v1NetworkScopeFormsWanForm.service';

@Component({
  selector: 'app-external-route',
  templateUrl: './external-route.component.html',
  styleUrls: ['./external-route.component.css'],
})
export class ExternalRouteComponent implements OnInit {
  public wanForm: WanForm;
  public externalRoutes: GetManyExternalRouteResponseDto;
  public isLoading = false;
  public tableComponentDto = new TableComponentDto();
  public wanFormId: string;
  public ModalMode = ModalMode;
  public perPage = 20;

  private modalSubscription: Subscription;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('vrfNameTemplate') vrfNameTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'External Routes',
    columns: [
      { name: 'IP', property: 'externalRouteIp' },
      { name: 'Description', property: 'description' },
      { name: 'VRF/Zone', template: () => this.vrfNameTemplate },
      { name: 'Environment', property: 'environment' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  public searchColumns: SearchColumnConfig[] = [
    { propertyName: 'externalRouteIp', displayName: 'IP' },
    { displayName: 'Description', propertyName: 'description' },
    { displayName: 'VRF/Zone', propertyName: 'vrfName' },
    { displayName: 'Environment', propertyName: 'environment' },
  ];

  constructor(
    private externalRouteService: V1NetworkScopeFormsWanFormExternalRouteService,
    private route: ActivatedRoute,
    private router: Router,
    private ngx: NgxSmartModalService,
    private tableContextService: TableContextService,
    private wanFormService: V1NetworkScopeFormsWanFormService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.wanForm = navigation.extras.state.data;
    }
  }

  ngOnInit(): void {
    this.wanFormId = this.route.snapshot.params.id;
    this.getExternalRoutes();
    if (!this.wanForm) {
      this.wanFormService.getOneWanForm({ id: this.wanFormId }).subscribe(data => {
        this.wanForm = data;
      });
    }
  }

  public onTableEvent(event): void {
    this.tableComponentDto = event;
    this.getExternalRoutes(event);
  }

  public openModal(modalMode: ModalMode, externalRoute?: ExternalRoute): void {
    const dto = new ExternalRouteModalDto();

    dto.modalMode = modalMode;
    dto.wanFormId = this.wanFormId;
    dto.externalRoute = externalRoute;

    this.subscribeToModal();
    this.ngx.setModalData(dto, 'externalRouteModal');
    this.ngx.getModal('externalRouteModal').open();
  }

  private subscribeToModal(): void {
    this.modalSubscription = this.ngx.getModal('externalRouteModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('externalRouteModal');
      this.modalSubscription.unsubscribe();
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      if (filteredResults) {
        this.getExternalRoutes(params);
      } else {
        this.getExternalRoutes();
      }
    });
  }

  public getExternalRoutes(event?) {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }
    this.externalRouteService
      .getManyExternalRoute({
        filter: [`wanFormId||eq||${this.wanFormId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.externalRoutes = data;
        },
        () => {
          this.externalRoutes = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public deleteExternalRoute(externalRoute: ExternalRoute): void {
    this.isLoading = true;
    if (externalRoute.deletedAt) {
      this.externalRouteService
        .deleteOneExternalRoute({
          id: externalRoute.id,
        })
        .subscribe(
          () => {
            this.getExternalRoutes();
          },
          () => {
            this.isLoading = false;
          },
          () => {
            this.isLoading = false;
          },
        );
    } else {
      this.externalRouteService.softDeleteOneExternalRoute({ id: externalRoute.id }).subscribe(
        () => {
          this.getExternalRoutes();
        },
        () => {
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        },
      );
    }
  }

  public restoreExternalRoute(externalRoute: ExternalRoute): void {
    this.isLoading = true;
    this.externalRouteService.restoreOneExternalRoute({ id: externalRoute.id }).subscribe(
      () => {
        this.getExternalRoutes();
      },
      () => {
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      },
    );
  }
}
