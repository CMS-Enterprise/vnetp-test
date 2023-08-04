import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { GetManyVrfResponseDto, V2AppCentricVrfsService, Vrf } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { VrfModalDto } from 'src/app/models/appcentric/vrf-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';

@Component({
  selector: 'app-vrf',
  templateUrl: './vrf.component.html',
  styleUrls: ['./vrf.component.css'],
})
export class VrfComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentVrfPage = 1;
  public perPage = 20;
  public vrfs = {} as GetManyVrfResponseDto;
  public tableComponentDto = new TableComponentDto();
  private vrfModalSubscription: Subscription;
  public tenantId: string;

  public isLoading = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'Vrfs',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: 'Policy Control Enforced', property: 'policyControlEnforced' },
      { name: 'Policy Control Enforcement Ingress', property: 'policyControlEnforcementIngress' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private vrfService: V2AppCentricVrfsService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
    private router: Router,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const match = event.url.match(/tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/);
        if (match) {
          const uuid = match[0].split('/')[2];
          this.tenantId = uuid;
        }
      }
    });
  }

  ngOnInit(): void {
    this.getVrfs();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getVrfs(event);
  }

  public getVrfs(event?): void {
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
    this.vrfService
      .getManyVrf({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.vrfs = data;
        },
        () => {
          this.vrfs = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public deleteVrf(vrf: Vrf): void {
    if (vrf.deletedAt) {
      this.vrfService.deleteOneVrf({ id: vrf.id }).subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getVrfs(params);
        } else {
          this.getVrfs();
        }
      });
    } else {
      this.vrfService
        .softDeleteOneVrf({
          id: vrf.id,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;

          // if filtered results boolean is true, apply search params in the
          // subsequent get call
          if (filteredResults) {
            this.getVrfs(params);
          } else {
            this.getVrfs();
          }
        });
    }
  }

  public restoreVrf(vrf: Vrf): void {
    if (!vrf.deletedAt) {
      return;
    }

    this.vrfService
      .restoreOneVrf({
        id: vrf.id,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getVrfs(params);
        } else {
          this.getVrfs();
        }
      });
  }

  public openVrfModal(modalMode: ModalMode, vrf?: Vrf): void {
    const dto = new VrfModalDto();

    dto.ModalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.vrf = vrf;
    }

    this.subscribeToVrfModal();
    this.ngx.setModalData(dto, 'vrfModal');
    this.ngx.getModal('vrfModal').open();
  }

  private subscribeToVrfModal(): void {
    this.vrfModalSubscription = this.ngx.getModal('vrfModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('vrfModal');
      this.vrfModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getVrfs(params);
      } else {
        this.getVrfs();
      }
    });
  }

  public importVrfsConfig(vrf: Vrf[]): void {
    // const tenantEnding = tenants.length > 1 ? 's' : '';
    // const modalDto = new YesNoModalDto(
    //   `Import Tier${tenantEnding}`,
    //   `Would you like to import ${tenants.length} tier${tenantEnding}?`,
    //   `Import Tier${tenantEnding}`,
    //   'Cancel',
    // );
    // const onConfirm = () => {
    //   this.tenantService
    //     .createManyTier({
    //       createManyTierDto: { bulk: this.sanitizeTiers(tiers) },
    //     })
    //     .subscribe(() => {
    //       this.getTiers();
    //     });
    // };
    // SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }
}
