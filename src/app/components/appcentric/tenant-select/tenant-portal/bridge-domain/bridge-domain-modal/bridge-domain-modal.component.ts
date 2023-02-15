import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { V2AppCentricBridgeDomainsService, BridgeDomain, Vrf, L3OutPaginationResponse, L3Out, V2AppCentricL3outsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { BridgeDomainModalDto } from 'src/app/models/appcentric/bridge-domain-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { NameValidator } from 'src/app/validators/name-validator';
import { MacAddressValidator } from 'src/app/validators/network-form-validators';

@Component({
  selector: 'app-bridge-domain-modal',
  templateUrl: './bridge-domain-modal.component.html',
  styleUrls: ['./bridge-domain-modal.component.css'],
})
export class BridgeDomainModalComponent implements OnInit {
  public isLoading = false;
  public modalMode: ModalMode;
  public bridgeDomainId: string;
  public form: FormGroup;
  public submitted: boolean;
  public tenantId: string;

  public tableComponentDto = new TableComponentDto();

  @Input() public l3Outs: L3Out[];
  @Input() public vrfs: Vrf[];
  public l3OutsTableData: L3OutPaginationResponse;

  public selectedL3Out: L3Out;

  public perPage = 20;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'L3 Outs',
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
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getL3Outs(event);
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
      this.getL3Outs();
    } else {
      this.form.controls.name.enable();
    }

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
    }
    this.ngx.resetModalData('bridgeDomainModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('bridgeDomainModal');
    this.buildForm();
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
    } as BridgeDomain;

    bridgeDomain.vrfId = vrfId;

    if (this.modalMode === ModalMode.Create) {
      this.createBridgeDomain(bridgeDomain);
    } else {
      this.editBridgeDomain(bridgeDomain);
    }
  }

  public getL3Outs(event?): void {
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
        err => (this.l3OutsTableData = null),
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
          this.getL3Outs(params);
        } else {
          this.getL3Outs();
        }
      });
  }

  public removeL3Out(l3Out: L3Out): void {
    this.bridgeDomainService
      .removeL3OutFromBridgeDomainBridgeDomain({
        bridgeDomainId: this.bridgeDomainId,
        l3OutId: l3Out.id,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getL3Outs(params);
        } else {
          this.getL3Outs();
        }
      });
  }
}
