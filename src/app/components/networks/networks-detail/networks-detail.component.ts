import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { HelpersService } from 'src/app/services/helpers.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subnet } from 'src/app/models/d42/subnet';
import { Contract } from 'src/app/models/firewall/contract';
import { ContractAssignment } from 'src/app/models/firewall/contract-assignment';
import { NetworkDetailHelpText } from 'src/app/helptext/help-text-networking';
import { Observable } from 'rxjs';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';

@Component({
  selector: 'app-networks-detail',
  templateUrl: './networks-detail.component.html'
})
export class NetworksDetailComponent implements OnInit, PendingChangesGuard {
  constructor(
    private automationApiService: AutomationApiService,
    private route: ActivatedRoute,
    private router: Router,
    private hs: HelpersService,
    public ngx: NgxSmartModalService,
    public helpText: NetworkDetailHelpText
  ) {}

  navIndex = 0;
  Id = '';
  subnet: Subnet;
  deployedState = false;
  deleteSubnetConfirm = '';
  dirty = false;

  newContractAssignment: ContractAssignment;
  contractAssignments: Array<ContractAssignment>;
  deletedContractAssignments: Array<ContractAssignment>;

  contracts: Array<Contract>;

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.dirty;
  }

  ngOnInit() {
    this.Id += this.route.snapshot.paramMap.get('id');
    this.newContractAssignment = new ContractAssignment();

    this.getNetwork();
  }

  getNetwork() {
    this.automationApiService.getSubnet(this.Id).subscribe(data => {
      this.subnet = data as Subnet;
      this.deployedState = this.hs.getBooleanCustomField(
        this.subnet,
        'deployed'
      );

      this.getAvailableContracts(this.subnet);
      this.getAssignedContracts(this.subnet);
    });
  }

  getAvailableContracts(subnet: Subnet) {
    this.automationApiService.getVrf(subnet.vrf_group_id).subscribe(data => {
      this.contracts = this.hs.getJsonCustomField(data, 'intravrf_contracts');
    });
  }

  getAssignedContracts(subnet: Subnet) {
    this.contractAssignments = this.hs.getJsonCustomField(
      subnet,
      'contract_assignments'
    ) as Array<ContractAssignment>;
  }

  getDeployedState(subnet: Subnet) {
    return this.hs.getBooleanCustomField(subnet, 'deployed');
  }

  getVlan(subnet: Subnet) {
    return this.hs.getNumberCustomField(subnet, 'vlan_number');
  }

  assignContract() {
    if (!this.contractAssignments) {
      this.contractAssignments = new Array<ContractAssignment>();
    }

    const duplicate = this.contractAssignments.filter(
      c =>
        c.ContractName === this.newContractAssignment.ContractName &&
        c.Type === this.newContractAssignment.Type
    );

    if (duplicate[0]) {
      return;
    }

    if (!this.newContractAssignment.ContractName || !this.newContractAssignment.Type) {
      return;
    }

    this.contractAssignments.push(this.newContractAssignment);
    this.newContractAssignment = new ContractAssignment();
    this.dirty = true;
  }

  deleteContract(contractAssignment: ContractAssignment) {
    const index = this.contractAssignments.indexOf(contractAssignment);

    if (index > -1) {
      this.contractAssignments.splice(index, 1);

      if (!this.deletedContractAssignments) {
        this.deletedContractAssignments = new Array<ContractAssignment>();
      }
      this.deletedContractAssignments.push(contractAssignment);
      this.dirty = true;
    }
  }

  saveContractAssignments() {
    this.dirty = false;

    let extra_vars: { [k: string]: any } = {};

    extra_vars.subnet = this.subnet;
    extra_vars.deployed_state = this.deployedState;
    extra_vars.contract_assignments = this.contractAssignments;
    extra_vars.deleted_contract_assignments = this.deletedContractAssignments;

    const body = { extra_vars };

    this.automationApiService
      .launchTemplate('save-contract-assignment', body, true)
      .subscribe(data => {}, error => {this.dirty = true; });
  }

  deleteSubnet() {
    if (this.deleteSubnetConfirm !== 'DELETE') {
      return;
    }

    let extra_vars: { [k: string]: any } = {};
    extra_vars.subnet_id = this.subnet.subnet_id;
    const body = { extra_vars };

    this.automationApiService
      .launchTemplate('delete-network', body, true)
      .subscribe(data => {
        this.dirty = false;
        this.router.navigate(['/networks']);
      }, error => {});

  }
}
