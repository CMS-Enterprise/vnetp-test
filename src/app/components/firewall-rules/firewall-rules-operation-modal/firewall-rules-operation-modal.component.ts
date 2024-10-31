import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import {
  FirewallRuleGroup,
  FirewallRule,
  Datacenter,
  NetworkObject,
  NetworkObjectGroup,
  ServiceObject,
  ServiceObjectGroup,
  V1TiersService,
  V1NetworkSecurityFirewallRulesService,
  RuleOperationDto,
  FirewallRuleGroupTypeEnum,
} from '../../../../../client';
import { ModalMode } from '../../../models/other/modal-mode';
import { YesNoModalDto } from '../../../models/other/yes-no-modal-dto';
import { DatacenterContextService } from '../../../services/datacenter-context.service';
import SubscriptionUtil from '../../../utils/SubscriptionUtil';
import { NameValidator } from '../../../validators/name-validator';
import { RuleOperationModalDto } from '../../../models/rule-operation-modal.dto';

@Component({
  selector: 'app-firewall-rules-operation-modal',
  templateUrl: './firewall-rules-operation-modal.component.html',
  styleUrls: ['./firewall-rules-operation-modal.component.css'],
})
export class FirewallRulesOperationModalComponent implements OnInit {
  public form: FormGroup;
  public firewallRuleGroups: FirewallRuleGroup[];
  public submitted: boolean;
  public existingFirewallRuleId: string;
  public currentTierId: string;
  public sourceFirewallRuleGroupId: string;
  public newFirewallRule: FirewallRule;
  public existingFirewallRule: any;
  public firewallRuleModalSubscription: Subscription;
  public ModalMode = ModalMode;
  public tiers: any;
  public currentDatacenter: Datacenter;
  public selectedTierId: string;
  public name: string;
  public sourceFirewallRuleGroupName: string;

  @Input() public networkObjects: NetworkObject[];
  @Input() public networkObjectGroups: NetworkObjectGroup[];
  @Input() public serviceObjects: ServiceObject[];
  @Input() public serviceObjectGroups: ServiceObjectGroup[];

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private tierService: V1TiersService,
    private firewallRuleService: V1NetworkSecurityFirewallRulesService,
    private datacenterContextService: DatacenterContextService,
  ) {}

  ngOnInit(): void {
    this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.currentDatacenter = cd;
        this.getTiers();
      }
    });
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('firewallRuleOperationModal');
    this.reset();
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('firewallRuleOperationModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      firewallRuleGroupId: ['', Validators.required],
      operation: ['', Validators.required],
      ruleIndex: ['', Validators.required],
      name: ['', NameValidator(3, 60)],
    });
  }

  public getData(): void {
    const dto = this.ngx.getModalData('firewallRuleOperationModal') as RuleOperationModalDto;

    this.existingFirewallRuleId = dto.ruleId;
    this.currentTierId = dto.tierId;
    this.selectedTierId = dto.tierId;
    this.sourceFirewallRuleGroupId = dto.sourceRuleGroupId;
    this.sourceFirewallRuleGroupName = dto.ruleGroupName;

    this.getFirewallRuleGroups();
    this.getFirewallRule(this.existingFirewallRuleId);
  }

  public getFirewallRuleGroups(tierId: string = this.currentTierId): void {
    this.form.controls.firewallRuleGroupId.setValue(null);
    this.form.controls.firewallRuleGroupId.updateValueAndValidity();
    this.tierService
      .getOneTier({
        id: tierId,
        join: ['firewallRuleGroups'],
      })
      .subscribe(data => {
        const allFirewallRuleGroups = data.firewallRuleGroups;
        this.firewallRuleGroups = allFirewallRuleGroups.filter(
          firewallRuleGroup => firewallRuleGroup.name !== 'Intravrf' && firewallRuleGroup.type !== FirewallRuleGroupTypeEnum.ZoneBased,
        );
      });
  }

  public getTiers(): void {
    this.tierService
      .getManyTier({
        filter: [`datacenterId||eq||${this.currentDatacenter.id}`, 'deletedAt||isnull'],
        perPage: 1000,
      })
      .subscribe(data => {
        this.tiers = data;
      });
  }

  public save() {
    this.submitted = true;
    const { firewallRuleGroupId, name, operation, ruleIndex } = this.form.value;
    const existingRuleId = this.existingFirewallRuleId;
    const destinationGroupId = firewallRuleGroupId;
    const firewallRuleOperationDto = {
      existingRuleId,
      destinationGroupId,
      operation,
      ruleIndex,
      name,
    } as RuleOperationDto;

    this.executeOperation(firewallRuleOperationDto);
  }

  public getFirewallRule(firewallRuleId: string): void {
    this.firewallRuleService.getOneFirewallRule({ id: firewallRuleId }).subscribe(data => {
      this.existingFirewallRule = data;
      this.form.controls.name.setValue(data.name);
      this.name = data.name;
    });
  }

  public executeOperation(ruleOperationDto: RuleOperationDto): void {
    const sourceTier = this.tiers.find(tier => tier.id === this.currentTierId);
    const sourceTierName = sourceTier.name;
    const destinationTier = this.tiers.find(tier => tier.id === this.selectedTierId);
    const destinationTierName = destinationTier.name;
    const destinationFirewallGroupName = this.firewallRuleGroups.find(
      firewallRuleGroup => firewallRuleGroup.id === ruleOperationDto.destinationGroupId,
    ).name;
    let message = `Are you sure you want to ${this.form.controls.operation.value} 
    the firewall rule '${this.name}' from '${sourceTierName} - ${this.sourceFirewallRuleGroupName}' to 
    '${destinationTierName} - ${destinationFirewallGroupName}'?`;

    if (this.form.controls.name.value !== this.name) {
      message = `Are you sure you want to ${this.form.controls.operation.value} the firewall rule 
      '${this.name}' from '${sourceTierName} - ${this.sourceFirewallRuleGroupName}' to 
      '${destinationTierName} - ${destinationFirewallGroupName}' and rename it from '${this.name}' to 
      '${this.form.controls.name.value}'?`;
    }
    const modalDto = new YesNoModalDto('Firewall rule operation', message);
    const onConfirm = () =>
      this.firewallRuleService.fwRuleOperationFirewallRule({ ruleOperationDto }).subscribe(
        data => {
          this.newFirewallRule = data;
        },
        () => undefined,
        () => {
          this.closeModal();
        },
      );
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }
}
