import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import {
  NatRuleGroup,
  NatRule,
  Datacenter,
  NetworkObject,
  NetworkObjectGroup,
  ServiceObject,
  V1TiersService,
  V1NetworkSecurityNatRulesService,
  RuleOperationDto,
  NatRuleGroupTypeEnum,
} from '../../../../../client';
import { ModalMode } from '../../../models/other/modal-mode';
import { YesNoModalDto } from '../../../models/other/yes-no-modal-dto';
import { DatacenterContextService } from '../../../services/datacenter-context.service';
import SubscriptionUtil from '../../../utils/SubscriptionUtil';
import { NameValidator } from '../../../validators/name-validator';
import { RuleOperationModalDto } from '../../../models/rule-operation-modal.dto';

@Component({
  selector: 'app-nat-rules-operation-modal',
  templateUrl: './nat-rules-operation-modal.component.html',
  styleUrls: ['./nat-rules-operation-modal.component.css'],
})
export class NatRulesOperationModalComponent implements OnInit {
  public form: FormGroup;
  public natRuleGroups: NatRuleGroup[];
  public submitted: boolean;
  public existingNatRuleId: string;
  public currentTierId: string;
  public sourceNatRuleGroupId: string;
  public existingNatRule: any;
  public newNatRule: NatRule;
  public ModalMode = ModalMode;
  public natRuleModalSubscription: Subscription;
  public tiers: any;
  public currentDatacenter: Datacenter;
  public selectedTierId: string;
  public name: string;
  public sourceNatRuleGroupName: string;

  @Input() public networkObjects: NetworkObject[];
  @Input() public networkObjectGroups: NetworkObjectGroup[];
  @Input() public serviceObjects: ServiceObject[];

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private tierService: V1TiersService,
    private natRuleService: V1NetworkSecurityNatRulesService,
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
    this.ngx.close('natRulesOperationModal');
    this.reset();
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('natRulesOperationModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      natRuleGroupId: ['', Validators.required],
      operation: ['', Validators.required],
      ruleIndex: ['', Validators.required],
      name: ['', NameValidator(3, 60)],
    });
  }

  public getData(): void {
    const dto = this.ngx.getModalData('natRulesOperationModal') as RuleOperationModalDto;

    this.existingNatRuleId = dto.ruleId;
    this.currentTierId = dto.tierId;
    this.selectedTierId = dto.tierId;
    this.sourceNatRuleGroupId = dto.sourceRuleGroupId;
    this.sourceNatRuleGroupName = dto.ruleGroupName;

    this.getNatRuleGroups();
    this.getNatRule(this.existingNatRuleId);
  }

  public getNatRuleGroups(tierId: string = this.currentTierId): void {
    this.form.controls.natRuleGroupId.setValue(null);
    this.form.controls.natRuleGroupId.updateValueAndValidity();
    this.tierService
      .getOneTier({
        id: tierId,
        join: ['natRuleGroups'],
      })
      .subscribe(data => {
        const allNatRuleGroups = data.natRuleGroups;
        this.natRuleGroups = allNatRuleGroups.filter(
          natRuleGroup => natRuleGroup.name !== 'Intravrf' && natRuleGroup.type !== NatRuleGroupTypeEnum.ZoneBased,
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
    const { natRuleGroupId, name, operation, ruleIndex } = this.form.value;
    const existingRuleId = this.existingNatRuleId;
    const destinationGroupId = natRuleGroupId;
    const natRuleOperationDto = {
      existingRuleId,
      destinationGroupId,
      operation,
      name,
      ruleIndex,
    } as RuleOperationDto;

    this.executeOperation(natRuleOperationDto);
  }

  public getNatRule(natRuleId: string): void {
    this.natRuleService.getOneNatRule({ id: natRuleId }).subscribe(data => {
      this.existingNatRule = data;
      this.form.controls.name.setValue(data.name);
      this.name = data.name;
    });
  }
  public executeOperation(ruleOperationDto: RuleOperationDto): void {
    const sourceTierName = this.tiers.find(tier => tier.id === this.currentTierId).name;
    const destinationTierName = this.tiers.find(tier => tier.id === this.selectedTierId).name;
    const destinationNatRuleGroupName = this.natRuleGroups.find(
      natRuleGroup => natRuleGroup.id === ruleOperationDto.destinationGroupId,
    ).name;
    let message = `Are you sure you want to ${this.form.controls.operation.value} the firewall rule 
    '${this.name}' from '${sourceTierName} - ${this.sourceNatRuleGroupName}' to 
    '${destinationTierName} - ${destinationNatRuleGroupName}'?`;
    if (this.form.controls.name.value !== this.name) {
      message = `Are you sure you want to ${this.form.controls.operation.value} the firewall rule 
      '${this.name}' from '${sourceTierName} - ${this.sourceNatRuleGroupName}' to 
      '${destinationTierName} - ${destinationNatRuleGroupName}' and rename it from '${this.name}' to '${this.form.controls.name.value}'?`;
    }
    const modalDto = new YesNoModalDto('Firewall rule operation', message);
    const onConfirm = () =>
      this.natRuleService.natRuleOperationNatRule({ ruleOperationDto }).subscribe(
        data => {
          this.newNatRule = data;
        },
        () => undefined,
        () => {
          this.closeModal();
        },
      );
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }
}
