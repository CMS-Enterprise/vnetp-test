import { Component, OnInit, OnDestroy } from '@angular/core';
import { Vrf } from 'src/app/models/d42/vrf';
import { Contract } from 'src/app/models/firewall/contract';
import { FilterEntry } from 'src/app/models/firewall/filter-entry';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { ActivatedRoute } from '@angular/router';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import CustomFieldUtil from 'src/app/utils/CustomFieldUtil';

@Component({
  selector: 'app-intra-vrf-rules',
  templateUrl: './intra-vrf-rules.component.html',
})
export class IntraVrfRulesComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute, private ngxSm: NgxSmartModalService, private api: AutomationApiService) {}

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
    const contracts = CustomFieldUtil.getJsonCustomField(this.vrf, 'intravrf_contracts') as Contract[];

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
    this.ngxSm.setModalData(ObjectUtil.deepCopy(contract), 'contractModal');
    this.editContractIndex = this.contracts.indexOf(contract);
    this.ngxSm.getModal('contractModal').open();
  }

  deleteContract(contract: Contract) {
    const index = this.contracts.indexOf(contract);
    if (index > -1) {
      this.contracts.splice(index, 1);

      if (!this.deletedContracts) {
        this.deletedContracts = new Array<Contract>();
      }
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
    this.contractModalSubscription = this.ngxSm.getModal('contractModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as Contract;

      if (data !== undefined) {
        this.saveContract(data);
      }
      this.ngxSm.resetModalData('contractModal');
      this.contractModalSubscription.unsubscribe();
    });
  }

  private unsubAll() {
    SubscriptionUtil.unsubscribe([this.contractModalSubscription]);
  }

  saveAll() {
    this.dirty = false;
    const extra_vars: { [k: string]: any } = {};

    extra_vars.vrf_id = this.vrf.id;
    extra_vars.vrf_name = this.vrf.name;
    extra_vars.contracts = this.contracts;
    extra_vars.deleted_contracts = this.deletedContracts;

    const body = { extra_vars };

    this.api.launchTemplate('deploy-intra-vrf-contracts', body, true).subscribe(
      data => {
        this.deletedContracts = new Array<Contract>();
      },
      error => {
        this.dirty = true;
      },
    );
  }

  refresh() {
    this.getVrf();
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
