import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import {
  V2AppCentricBridgeDomainsService,
  BridgeDomain,
  Vrf,
  L3OutPaginationResponse,
  L3Out,
  V2AppCentricL3outsService,
  V2AppCentricVrfsService,
  V2AppCentricRouteProfilesService,
  RouteProfile,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { BridgeDomainModalDto } from 'src/app/models/appcentric/bridge-domain-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { NameValidator } from 'src/app/validators/name-validator';
import { MacAddressValidator } from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-bridge-domain-modal',
  templateUrl: './bridge-domain-modal.component.html',
  styleUrls: ['./bridge-domain-modal.component.css'],
})
export class BridgeDomainModalComponent implements OnInit, OnDestroy {
  public isLoading = false;
  public modalMode: ModalMode;
  public bridgeDomainId: string;
  public form: FormGroup;
  public submitted: boolean;
  public tenantId: string;

  private l3OutForRouteProfileSubscription: Subscription;

  public tableComponentDto = new TableComponentDto();

  public l3Outs: L3Out[];
  public filteredL3Outs: L3Out[];
  public vrfs: Vrf[];
  public routeProfiles: RouteProfile[];
  public l3OutsTableData: L3OutPaginationResponse;

  public selectedL3Out: L3Out;

  public perPage = 20;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'bd l3Outs',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private bridgeDomainService: V2AppCentricBridgeDomainsService,
    private router: Router,
    private tableContextService: TableContextService,
    private l3OutService: V2AppCentricL3outsService,
    private vrfService: V2AppCentricVrfsService,
    private routeProfileService: V2AppCentricRouteProfilesService,
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
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy(): void {
    this.unsubAll();
    this.reset();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getL3OutsTableData();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('bridgeDomainModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('bridgeDomainModal') as BridgeDomainModalDto);

    this.modalMode = dto.modalMode;
    if (this.modalMode === ModalMode.Edit) {
      this.bridgeDomainId = dto.bridgeDomain.id;
      this.getL3OutsTableData();
      this.getL3Outs();
      this.getRouteProfiles();
    } else {
      this.form.controls.name.enable();
      this.form.controls.unicastRouting.setValue(true);
      this.form.controls.arpFlooding.setValue(true);
      this.form.controls.limitLocalIpLearning.setValue(true);
      this.form.controls.epMoveDetectionModeGarp.setValue(false);
    }

    this.getVrfs();

    const bridgeDomain = dto.bridgeDomain;
    if (bridgeDomain !== undefined) {
      this.form.controls.name.setValue(bridgeDomain.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(bridgeDomain.description);
      this.form.controls.alias.setValue(bridgeDomain.alias);
      this.form.controls.unicastRouting.setValue(bridgeDomain.unicastRouting);
      this.form.controls.arpFlooding.setValue(bridgeDomain.arpFlooding);
      this.form.controls.bdMacAddress.setValue(bridgeDomain.bdMacAddress);
      this.form.controls.limitLocalIpLearning.setValue(bridgeDomain.limitLocalIpLearning);
      this.form.controls.epMoveDetectionModeGarp.setValue(bridgeDomain.epMoveDetectionModeGarp);
      this.form.controls.vrfId.setValue(bridgeDomain.vrfId);
      this.form.controls.l3OutForRouteProfileId.setValue(bridgeDomain.l3OutForRouteProfileId);
      this.form.controls.routeProfileId.setValue(bridgeDomain.routeProfileId);
    }

    this.ngx.resetModalData('bridgeDomainModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('bridgeDomainModal');
    this.buildForm();
    this.unsubAll();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      unicastRouting: [null],
      arpFlooding: [null],
      bdMacAddress: ['', MacAddressValidator],
      limitLocalIpLearning: [null],
      epMoveDetectionModeGarp: [null],
      vrfId: ['', Validators.required],
      l3OutForRouteProfileId: [''],
      routeProfileId: [''],
    });
  }

  public setFormValidators(): void {
    const routeProfile = this.form.controls.routeProfileId;
    const l3OutForRouteProfile = this.form.controls.l3OutForRouteProfileId;

    this.l3OutForRouteProfileSubscription = l3OutForRouteProfile.valueChanges.subscribe(l3OutForRpValue => {
      if (l3OutForRpValue) {
        routeProfile.setValidators(Validators.required);
        routeProfile.setValue('');
      } else {
        routeProfile.clearValidators();
        routeProfile.setValue('');
      }
      routeProfile.updateValueAndValidity();
    });
  }

  private createBridgeDomain(bridgeDomain: BridgeDomain): void {
    this.bridgeDomainService.createBridgeDomain({ bridgeDomain }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editBridgeDomain(bridgeDomain: BridgeDomain): void {
    bridgeDomain.name = null;
    bridgeDomain.tenantId = null;
    bridgeDomain.vrfId = null;
    this.bridgeDomainService
      .updateBridgeDomain({
        uuid: this.bridgeDomainId,
        bridgeDomain,
      })
      .subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const {
      name,
      description,
      alias,
      unicastRouting,
      arpFlooding,
      bdMacAddress,
      limitLocalIpLearning,
      epMoveDetectionModeGarp,
      vrfId,
      l3OutForRouteProfileId,
      routeProfileId,
    } = this.form.value;

    const tenantId = this.tenantId;

    const bridgeDomain = {
      name,
      description,
      alias,
      tenantId,
      unicastRouting,
      arpFlooding,
      bdMacAddress,
      limitLocalIpLearning,
      epMoveDetectionModeGarp,
      l3OutForRouteProfileId,
      routeProfileId,
    } as BridgeDomain;

    bridgeDomain.vrfId = vrfId;

    if (this.modalMode === ModalMode.Create) {
      this.createBridgeDomain(bridgeDomain);
    } else {
      this.editBridgeDomain(bridgeDomain);
    }
  }

  public getL3OutsTableData(): void {
    this.isLoading = true;
    this.bridgeDomainService
      .findOneBridgeDomain({
        uuid: this.bridgeDomainId,
        relations: 'l3outs',
      })
      .subscribe(
        data => {
          const l3PagResponse = {} as L3OutPaginationResponse;
          l3PagResponse.count = data.l3outs.length;
          l3PagResponse.page = 1;
          l3PagResponse.pageCount = 1;
          l3PagResponse.total = data.l3outs.length;
          l3PagResponse.data = data.l3outs;
          this.l3OutsTableData = l3PagResponse;
        },
        () => (this.l3OutsTableData = null),
        () => (this.isLoading = false),
      );
  }

  public getL3Outs(): void {
    this.isLoading = true;
    this.l3OutService
      .findAllL3Out({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: 1,
        perPage: 1000,
      })
      .subscribe(
        data => {
          const allL3Outs = data.data;
          this.l3Outs = allL3Outs;
          const usedL3Outs = this.l3OutsTableData.data;
          const usedL3OutIds = usedL3Outs.map(l3Out => l3Out.id);
          this.filteredL3Outs = allL3Outs.filter(l3Out => !usedL3OutIds.includes(l3Out.id));
        },
        () => (this.l3Outs = null),
        () => (this.isLoading = false),
      );
  }

  public getVrfs(): void {
    this.isLoading = true;
    this.vrfService
      .findAllVrf({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: 1,
        perPage: 1000,
      })
      .subscribe(
        data => {
          this.vrfs = data.data;
        },
        () => (this.vrfs = null),
        () => (this.isLoading = false),
      );
  }

  public getRouteProfiles(): void {
    this.isLoading = true;
    this.routeProfileService
      .findAllRouteProfile({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: 1,
        perPage: 1000,
      })
      .subscribe(
        data => {
          this.routeProfiles = data.data;
        },
        () => (this.routeProfiles = null),
        () => (this.isLoading = false),
      );
  }

  public addL3Out(): void {
    this.bridgeDomainService
      .addL3OutToBridgeDomainBridgeDomain({
        bridgeDomainId: this.bridgeDomainId,
        l3OutId: this.selectedL3Out.id,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getL3OutsTableData();
        } else {
          this.getL3OutsTableData();
        }
        this.getL3Outs();
        this.selectedL3Out = null;
      });
  }

  public removeL3Out(l3Out: L3Out): void {
    const modalDto = new YesNoModalDto('Remove L3Out', `Are you sure you want to remove L3Out ${l3Out.name}?`);
    const onConfirm = () => {
      this.bridgeDomainService
        .removeL3OutFromBridgeDomainBridgeDomain({
          bridgeDomainId: this.bridgeDomainId,
          l3OutId: l3Out.id,
        })
        .subscribe(
          () => {
            const params = this.tableContextService.getSearchLocalStorage();
            const { filteredResults } = params;

            // if filtered results boolean is true, apply search params in the
            // subsequent get call
            if (filteredResults) {
              this.getL3OutsTableData();
            } else {
              this.getL3OutsTableData();
            }
          },
          () => {},
          () => this.getL3Outs(),
        );
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  private unsubAll(): void {
    SubscriptionUtil.unsubscribe([this.l3OutForRouteProfileSubscription]);
  }
}
