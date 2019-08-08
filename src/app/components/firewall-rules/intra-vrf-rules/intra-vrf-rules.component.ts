import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Vrf } from 'src/app/models/d42/vrf';
import { Contract } from 'src/app/models/firewall/contract';
import { FilterEntry } from 'src/app/models/firewall/filter-entry';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, Observable } from 'rxjs';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { HelpersService } from 'src/app/services/helpers.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-intra-vrf-rules',
  templateUrl: './intra-vrf-rules.component.html',
  styleUrls: ['./intra-vrf-rules.component.css']
})
export class IntraVrfRulesComponent implements OnInit, OnDestroy, PendingChangesGuard {

  constructor(
    private route: ActivatedRoute,
    private ngxSm: NgxSmartModalService,
    private api: AutomationApiService,
    private hs: HelpersService) { }

  Id: string;
  vrf: Vrf;
  contracts: Array<Contract>;
  deletedContracts: Array<Contract>;
  deletedFilterEntries: Array<FilterEntry>;
  editContractIndex: number;
  contractModalMode: ModalMode;
  contractModalSubscription: Subscription;
  dirty: boolean;

  getVrf() {
    this.api.getVrf(this.Id).subscribe(data => {
      this.vrf = data;
      this.getVrfCustomFields();
    });
  }

  getVrfCustomFields() {
    const contracts = this.hs.getJsonCustomField(this.vrf, 'intravrf_contracts') as Array<Contract>;

    if (contracts) {
      this.contracts = contracts;
    }
  }

  createContract() {
    this.subscribeToContractModal();
    this.contractModalMode = ModalMode.Create;
    this.ngxSm.getModal('contractModal').open();
  }

  editContract(contract: Contract) {
    this.subscribeToContractModal();
    this.contractModalMode = ModalMode.Edit;
    this.ngxSm.setModalData(this.hs.deepCopy(contract), 'contractModal');
    this.editContractIndex = this.contracts.indexOf(contract);
    this.ngxSm.getModal('contractModal').open();
  }

  deleteContract(contract: Contract) {
    const index = this.contracts.indexOf(contract);
    if ( index > -1) {
      this.contracts.splice(index, 1);

      if (!this.deletedContracts) { this.deletedContracts = new Array<Contract>(); }
      this.deletedContracts.push(contract);
      this.dirty = true;
    }
  }

  saveContract(contract: Contract) {
    if (this.contractModalMode === ModalMode.Create) {
      this.contracts.push(contract);
    } else {
      this.contracts[this.editContractIndex] = contract;
    }
    this.dirty = true;
  }

  subscribeToContractModal() {
    this.contractModalSubscription =
    this.ngxSm.getModal('contractModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as Contract;

      if (data !== undefined) {
        this.saveContract(data);
      }
      this.ngxSm.resetModalData('contractModal');
      this.contractModalSubscription.unsubscribe();
    });
  }

  private unsubAll() {
    [this.contractModalSubscription]
      .forEach(sub => {
        try {
          if (sub) {
          sub.unsubscribe();
          }
        } catch (e) {
          console.error(e);
        }
      });
  }

 saveAll() {
    this.dirty = false;
    let extra_vars: {[k: string]: any} = {};

    extra_vars.vrf_id = this.vrf.id;
    extra_vars.vrf_name = this.vrf.name;
    extra_vars.contracts = this.contracts;
    extra_vars.deleted_contracts = this.deletedContracts;

    const body = { extra_vars };

    this.api.launchTemplate('deploy-intra-vrf-contracts', body, true).subscribe(data => {
      this.deletedContracts = new Array<Contract>();
    }, error => { this.dirty = true; });
  }

  refresh() {
    this.getVrf();
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.dirty;
  }

  ngOnInit() {
    this.Id = this.route.snapshot.paramMap.get('id');
    this.contracts = new Array<Contract>();
    this.deletedContracts = new Array<Contract>();
    this.getVrf();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
