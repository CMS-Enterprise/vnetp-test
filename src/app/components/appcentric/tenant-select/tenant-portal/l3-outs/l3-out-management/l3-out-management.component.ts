/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import {
  V2AppCentricL3outsService,
  V2AppCentricVrfsService,
  V2AppCentricBridgeDomainsService,
  V2AppCentricEndpointGroupsService,
  V2AppCentricEndpointSecurityGroupsService,
  L3Out,
  EndpointGroup,
  EndpointSecurityGroup,
  BridgeDomain,
  V2AppCentricAppCentricSubnetsService,
} from '../../../../../../../../client';
import { ActivatedRoute, Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-l3-out-management',
  templateUrl: './l3-out-management.component.html',
  styleUrl: './l3-out-management.component.css',
})
export class L3OutManagementComponent implements OnInit {
  toggleExpand(bd: any): void {
    bd.expanded = !bd.expanded;
  }

  epgs: EndpointGroup[] = [];
  esgs: EndpointSecurityGroup[] = [];
  bridgeDomains: any[] = [];
  tenantId: string;

  l3Out: L3Out;

  constructor(
    public l3OutsService: V2AppCentricL3outsService,
    public vrfService: V2AppCentricVrfsService,
    public bridgeDomainService: V2AppCentricBridgeDomainsService,
    public epgService: V2AppCentricEndpointGroupsService,
    public esgService: V2AppCentricEndpointSecurityGroupsService,
    public appcentricSubnetService: V2AppCentricAppCentricSubnetsService,
    public router: Router,
    public route: ActivatedRoute,
    public dialog: MatDialog,
    public fb: FormBuilder,
  ) {}

  form = this.fb.group({});

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tenantId = params.get('tenantId') || '';
      const l3OutId = params.get('id');
      if (l3OutId) {
        this.l3OutsService
          .getOneL3Out({
            id: l3OutId,
            relations: ['vrf', 'bridgeDomains', 'endpointGroups', 'endpointSecurityGroups'],
          })
          .subscribe(l3Out => {
            this.l3Out = l3Out;
            this.loadBridgeDomains();
          });
      }
    });
  }

  buildForm(): void {
    this.bridgeDomains.forEach(bd => {
      this.form.addControl(
        bd.id,
        this.fb.group({
          subnets: this.fb.array(
            bd.subnets.map(s =>
              this.fb.group({
                advertisedExternally: [s.advertisedExternally],
              }),
            ),
          ),
          epgs: this.fb.array(
            bd.epgs.map(e =>
              this.fb.group({
                allowComm: [this.allowsConnection(e.id)],
              }),
            ),
          ),
          esgs: this.fb.array(
            bd.esgs.map(e =>
              this.fb.group({
                allowComm: [this.allowsConnection(e.id)],
              }),
            ),
          ),
        }),
      );
    });
  }

  public allowsConnection(id: string): boolean {
    return this.l3Out.endpointGroups.some(eg => eg.id === id) || this.l3Out.endpointSecurityGroups.some(esg => esg.id === id);
  }

  public loadBridgeDomains(): void {
    if (!this.l3Out?.vrfId) {
      return;
    }

    this.bridgeDomainService
      .getManyBridgeDomain({
        filter: [`tenantId||eq||${this.tenantId}`, `vrfId||eq||${this.l3Out.vrfId}`],
        relations: ['subnets'],
      })
      .subscribe(bridgeDomains => {
        this.bridgeDomains = (bridgeDomains as any) || [];
        this.loadEpgs();
      });
  }

  public loadEpgs(): void {
    if (!this.bridgeDomains || this.bridgeDomains.length === 0) {
      return;
    }
    const bridgeDomainIds = this.bridgeDomains.map(bd => bd.id).join(',');

    this.epgService
      .getManyEndpointGroup({
        filter: [`tenantId||eq||${this.tenantId}`, `bridgeDomainId||in||${bridgeDomainIds}`],
        relations: ['consumedContracts', 'providedContracts', 'intraContracts', 'applicationProfile'],
        page: 1,
        perPage: 100,
      })
      .subscribe(epgs => {
        this.epgs = epgs.data || [];
        this.updateEpgAssociations();
        this.loadEsgs();
      });
  }

  public loadEsgs(): void {
    this.esgService
      .getManyEndpointSecurityGroup({
        filter: [`tenantId||eq||${this.tenantId}`],
        relations: ['selectors'],
        page: 1,
        perPage: 100,
      })
      .subscribe(esgs => {
        this.esgs = esgs.data || [];
        this.updateEsgAssociations();
      });
  }

  public updateEpgAssociations(): void {
    if (!this.epgs || !this.bridgeDomains) {
      return;
    }
    // Group EPGs by bridge domain
    this.bridgeDomains.forEach(bd => {
      bd.epgs = this.epgs.filter(epg => epg.bridgeDomainId === bd.id);
    });
  }

  public updateEsgAssociations(): void {
    if (!this.esgs || !this.bridgeDomains) {
      return;
    }

    // For ESGs, we need to check which ones are associated with the EPGs in each bridge domain
    this.bridgeDomains.forEach(bd => {
      const epgIds = bd.epgs.map(epg => epg.id);
      bd.esgs = this.esgs.filter(esg =>
        esg.selectors?.some(selector => selector.endpointGroupId && epgIds.includes(selector.endpointGroupId)),
      );
    });

    this.buildForm();
  }

  public openChangePreview(bd: BridgeDomain): void {
    this.applyOneChange(bd);
  }

  public applyOneChange(bd: BridgeDomain, bulk = false): void {
    const bdForm = this.form.get(bd.id);

    if (!bdForm) {
      console.error('Bridge Domain form not found');
      return;
    }

    const subnets = bdForm.get('subnets')?.value;
    const epgs = bdForm.get('epgs')?.value;
    const esgs = bdForm.get('esgs')?.value;

    const subnetsToUpdate = bd.subnets
      .map((s, index) => ({
        id: s.id,
        advertisedExternally: subnets[index].advertisedExternally,
      }))
      .filter((s, index) => s.advertisedExternally !== bd.subnets[index].advertisedExternally);

    const epgsToUpdate = bd['epgs']
      .map((e, index) => ({
        ...e,
        allowComm: epgs[index].allowComm,
      }))
      .filter((e, index) => e.allowComm !== this.allowsConnection(bd['epgs'][index].id));

    const esgsToUpdate = bd['esgs']
      .map((e, index) => ({
        ...e,
        allowComm: esgs[index].allowComm,
      }))
      .filter((e, index) => e.allowComm !== this.allowsConnection(bd['esgs'][index].id));

    // Create an array of all observables
    const updateObservables = [
      ...subnetsToUpdate.map(s =>
        this.appcentricSubnetService.updateOneAppCentricSubnet({
          id: s.id,
          appCentricSubnet: s as any,
        }),
      ),
      ...epgsToUpdate.map(e =>
        e.allowComm
          ? this.l3OutsService.addEndpointGroupToL3OutL3Out({
              id: this.l3Out.id,
              endpointGroup: e,
            })
          : this.l3OutsService.removeEpgFromL3OutL3Out({
              id: this.l3Out.id,
              epgId: e.id,
            }),
      ),
      ...esgsToUpdate.map(e =>
        e.allowComm
          ? this.l3OutsService.addEndpointSecurityGroupToL3OutL3Out({
              id: this.l3Out.id,
              endpointSecurityGroup: e,
            })
          : this.l3OutsService.removeEndpointSecurityGroupFromL3OutL3Out({
              id: this.l3Out.id,
              esgId: e.id,
            }),
      ),
    ];

    // Execute all updates and then refresh the form
    if (updateObservables.length > 0) {
      forkJoin(updateObservables).subscribe({
        complete: () => {
          if (!bulk) {
            // Refresh L3Out data and rebuild form
            this.l3OutsService
              .getOneL3Out({
                id: this.l3Out.id,
                relations: ['vrf', 'bridgeDomains', 'endpointGroups', 'endpointSecurityGroups'],
              })
              .subscribe(updatedL3Out => {
                this.l3Out = updatedL3Out;
                this.ngOnInit();
              });
          }
        },
      });
    } else if (!bulk) {
      this.ngOnInit();
    }
  }

  public applyAllChanges(): void {
    this.bridgeDomains.forEach(bd => {
      if (this.hasBridgeDomainChanges(bd)) {
        this.applyOneChange(bd, true);
      }
    });
  }

  public hasChanges(): boolean {
    return this.bridgeDomains.some(bd => this.hasBridgeDomainChanges(bd));
  }

  public hasBridgeDomainChanges(bd: BridgeDomain): boolean {
    const bdForm = this.form.get(bd.id);
    if (!bdForm) {
      return false;
    }

    // Check subnets
    const subnetsForm = bdForm.get('subnets')?.value;
    if (subnetsForm) {
      const hasSubnetChanges = bd.subnets.some((s, index) => subnetsForm[index]?.advertisedExternally !== s.advertisedExternally);
      if (hasSubnetChanges) {
        return true;
      }
    }

    // Check EPGs
    const epgsForm = bdForm.get('epgs')?.value;
    if (epgsForm) {
      const hasEpgChanges = (bd as any).epgs.some((e: any, index: number) => epgsForm[index]?.allowComm !== this.allowsConnection(e.id));
      if (hasEpgChanges) {
        return true;
      }
    }

    // Check ESGs
    const esgsForm = bdForm.get('esgs')?.value;
    if (esgsForm) {
      const hasEsgChanges = (bd as any).esgs.some((e: any, index: number) => esgsForm[index]?.allowComm !== this.allowsConnection(e.id));
      if (hasEsgChanges) {
        return true;
      }
    }

    return false;
  }

  public hasData(bd: BridgeDomain): boolean {
    return bd.subnets.length > 0 || (bd as any).epgs.length > 0 || (bd as any).esgs.length > 0;
  }

  public navigateBack(): void {
    this.router.navigate(['/appcentric/tenant-select/edit', this.tenantId, 'home', { outlets: { 'tenant-portal': 'l3-outs' } }], {
      queryParamsHandling: 'merge',
    });
  }
}
