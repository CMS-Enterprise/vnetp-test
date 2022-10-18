import { Component, Input } from '@angular/core';
import { SubnetImportCollectionDto, V1NetworkSubnetsService, V1NetworkVlansService, V1SelfServiceService, V1TiersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Tab } from 'src/app/common/tabs/tabs.component';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-self-service-bulk-upload-modal',
  templateUrl: './self-service-bulk-upload-modal.component.html',
})
export class SelfServiceBulkUploadModalComponent {
  @Input() selfService;
  navIndex = 0;

  public tabs: Tab[] = [
    // { name: 'LOGS' },
    { name: 'Subnets' },
    { name: 'VLANs' },
    { name: 'Network Objects' },
    { name: 'Service Objects' },
    { name: 'Network Object Groups' },
    { name: 'Service Object Groups' },
    { name: 'Intervrf FW Rules' },
    { name: 'External FW Rules' },
    { name: 'Intervrf NAT Rules' },
    { name: 'External NAT Rules' },
  ];

  constructor(
    private ngx: NgxSmartModalService,
    public datacenterService: DatacenterContextService,
    public tierContextService: TierContextService,
    private subnetsService: V1NetworkSubnetsService,
    private vlansService: V1NetworkVlansService,
    private selfServiceService: V1SelfServiceService,
  ) {}

  private sanitizeImportData(objects) {}

  public handleTabChange(tab) {
    if (this.navIndex === this.tabs.findIndex(t => t.name === tab.name)) {
      return;
    }
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);
  }

  public importObjects() {
    console.log('this.selfService', this.selfService);
    // const tierName =  this.selfService.dcsTier;
    // let dto = {} as any;
    // dto.datacenterId = this.datacenterService.currentDatacenterValue.id;
    // if (this.navIndex === 0) {
    //   this.selfService.convertedConfig.artifact.subnets.map(subnet => {
    //     subnet.vrfName = tierName;
    //     return subnet;
    //   })
    //   dto.subnets = this.selfService.convertedConfig.artifact.subnets;
    // };
    // if (this.navIndex === 1) {
    //   this.selfService.convertedConfig.artifact.vlans.map(vlan => {
    //     vlan.vrfName = tierName;
    //     return vlan;
    //   })
    //   dto = this.selfService.convertedConfig.artifact.subnets;
    // };
    // console.log('dto',dto);
    const modalDto = new YesNoModalDto('Import', `Are you sure you would like to import objects?`);
    const onConfirm = () => {
      this.selfServiceService.bulkUploadSelfService({ selfService: this.selfService }).subscribe(data => {
        console.log('data', data);
      });
      // if (this.navIndex === 0) {
      //   this.subnetsService.bulkImportSubnetsSubnet({
      //     subnetImportCollectionDto: dto
      //   }).subscribe((data) => {
      //     console.log('data', data);
      //   })
      // }
      // if (this.navIndex === 1) {
      //   this.vlansService.createManyVlan({ createManyVlanDto: { bulk: dto } }).subscribe(() => {
      //     console.log('fin')
      //   })
      // }
    };

    const onClose = () => {};

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }
}

// [
//   {
//       "id": "289a095a-55f4-4a32-a382-6360ab3dc435",
//       "info": {
//           "errors": {
//               "notFound?": "wheres your obj?",
//               "wrongType": {
//                   "expectedType": "X",
//                   "recievedType": "Y"
//               },
//               "someOtherError": "why"
//           },
//           "lineNumber": 1000
//       },
//       "name": "vlan1",
//       "tierId": "6c74c9e7-4d0e-48fc-a4f7-a546e7f9891e",
//       "version": 1,
//       "createdAt": "2022-10-06T14:09:38.381Z",
//       "deletedAt": null,
//       "updatedAt": "2022-10-06T14:09:38.381Z",
//       "vlanNumber": 1,
//       "description": "",
//       "vcdVlanType": null,
//       "provisionedAt": null,
//       "provisionedVersion": null
//   }
// ]

// {
//   "datacenterId": "5a0a3af0-6be9-4e17-9870-ae6c9dba4236",
//   "subnets": [
//       {
//           "name": "http",
//           "description": "",
//           "protocol": "TCP",
//           "sourcePorts": "1-65535",
//           "destinationPorts": "80",
//           "vrf_name": "tier1"
//       }
//   ]
// }

// {
//   "datacenterId": "5a0a3af0-6be9-4e17-9870-ae6c9dba4236",
//   "subnets": [
//       {
//           "id": "289a095a-55f4-4a32-a382-6360ab3dc435",
//           "info": {
//               "errors": {
//                   "notFound?": "wheres your obj?",
//                   "wrongType": {
//                       "expectedType": "X",
//                       "recievedType": "Y"
//                   },
//                   "someOtherError": "why"
//               },
//               "lineNumber": 1000
//           },
//           "name": "vlan1",
//           "tierId": "6c74c9e7-4d0e-48fc-a4f7-a546e7f9891e",
//           "version": 1,
//           "createdAt": "2022-10-06T14:09:38.381Z",
//           "deletedAt": null,
//           "updatedAt": "2022-10-06T14:09:38.381Z",
//           "vlanNumber": 1,
//           "description": "",
//           "vcdVlanType": null,
//           "provisionedAt": null,
//           "provisionedVersion": null,
//           "vrfName": "tier1"
//       }
//   ]
// }
