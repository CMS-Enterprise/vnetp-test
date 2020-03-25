import { Component, OnInit, Input } from '@angular/core';
import { WizardSection } from 'src/app/models/wizard/wizard-data';
import { pieChartData, lineChartData, pieData } from './mockChartData';
import { V1VtsService } from 'api_client';
import { Papa } from 'ngx-papaparse';
@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent implements OnInit {
  WizardSections = new Array<WizardSection>();
  WizardProgress = 50;
  pieChartData: any;
  lineChartData: any;

  replicationQueueDepth: any;
  replicationsNotCompleted: any;

  formattedQueueDepth: [];
  formattedReplicationData: any;

  // options
  pieView: any[] = [700, 300];
  pieShowLegend = true;
  pieShowLabels = true;
  legendPosition = 'below';

  pieColorScheme = {
    domain: ['#e84d4d', '#5ac4f9', '#ffdf5a'],
  };

  // line chart options
  view: any[] = [700, 275];
  legend = true;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  showYAxisLabel = true;
  showXAxisLabel = true;
  xAxisLabel = 'Time';
  yAxisLabel = 'Number Queued';
  timeline = false;
  yScaleMax = 150;
  colorScheme = {
    domain: ['#ffad00'],
  };

  constructor(private vtsService: V1VtsService, private papa: Papa) {}

  getProgressBarPercentage(statusProgress: number) {
    return `${statusProgress}%`;
  }

  countStatuses(status: string) {
    switch (status) {
      case 'error':
        this.pieChartData[0].value = this.pieChartData[0].value + 1;
        break;
      case 'write':
        this.pieChartData[1].value = this.pieChartData[1].value + 1;
        break;
      case 'queued':
        this.pieChartData[2].value = this.pieChartData[2].value + 1;
        break;
      default:
        throw new Error('Invalid Status Type');
    }
  }

  ngOnInit() {
    this.vtsService.v1VtsReplicationQueueDepthPost().subscribe(data => {
      this.replicationQueueDepth = data;
      const options = {
        skipEmptyLines: true,
        header: true,
      };
      let parsedData = null;
      let papaParsedData = null;
      if (this.replicationQueueDepth) {
        parsedData = JSON.parse(JSON.stringify(this.replicationQueueDepth));
        papaParsedData = this.papa.parse(parsedData, options);
        console.log(papaParsedData);
        this.replicationQueueDepth = [{ name: 'Replication Queue Depth', series: [] }];
        papaParsedData.data.map(item => {
          this.replicationQueueDepth[0].series.push({
            name: new Date(Number(item.Timestamp)),
            value: item['Queue Depth'],
          });
        });
        this.lineChartData = this.replicationQueueDepth;
      }
    });

    this.vtsService.v1VtsReplicationNotCompletedPost().subscribe(data => {
      this.replicationsNotCompleted = data;
      const options = {
        skipEmptyLines: true,
        header: true,
      };
      let parsedData = null;
      let papaParsedData = null;
      if (this.replicationsNotCompleted) {
        parsedData = JSON.parse(JSON.stringify(this.replicationsNotCompleted));
        papaParsedData = this.papa.parse(parsedData, options);
        console.log(papaParsedData);
        this.pieChartData = [
          {
            name: 'error',
            value: 0,
          },
          {
            name: 'write',
            value: 0,
          },
          {
            name: 'queued',
            value: 0,
          },
        ];
        this.formattedReplicationData = [];
        papaParsedData.data.map(item => {
          const replicationData = item.Date.split(' ');
          this.formattedReplicationData.push({
            date: `${replicationData[0]} ${replicationData[1]}`,
            status: `${replicationData[2]}`,
            volser: `${replicationData[3]}`,
            storagePool: `${replicationData[4]}`,
            cgx: `${replicationData[5]}`,
          });
          this.countStatuses(replicationData[2]);
        });
        console.log(this.pieChartData);
      }
    });
    this.pieChartData = pieChartData;
    this.lineChartData = lineChartData;

    this.WizardSections = [
      {
        Name: 'VDC1',
        StatusText: 'Defining',
        StatusProgress: 10,
        Categories: [
          {
            Name: 'Onboarding',
            HasError: false,
            HasWarning: false,
            Subcategories: [
              {
                Name: 'Tenant Intialization',

                Items: [
                  {
                    Name: 'Networking',
                    Status: 'Completed',
                  },
                  {
                    Name: 'Security',
                    Status: 'Completed',
                  },
                  {
                    Name: 'CMDB',
                    Status: 'In Progress',
                  },
                ],
              },
              {
                Name: 'User Management',

                Items: [
                  {
                    Name: 'Create Users',
                    Status: 'In Progress',
                  },
                ],
              },
            ],
          },
          {
            Name: 'Configuring Datacenter',

            Subcategories: [
              {
                Name: 'Data Protection',

                Items: [
                  {
                    Name: 'Spectrum Protect',
                    Status: 'Not Started',
                  },
                  {
                    Name: 'Actifio',
                    Status: 'Not Started',
                  },
                  {
                    Name: 'SFTP',
                    Status: 'Not Started',
                  },
                ],
              },
              {
                Name: 'Networking',
                Items: [
                  {
                    Name: 'Subnets',
                    Link: '/networks',
                    Status: 'Not Started',
                  },
                  {
                    Name: 'Routing',
                    Link: 'static-routes',
                    Status: 'Not Started',
                  },
                  {
                    Name: 'Firewall Rules',
                    Status: 'Not Started',
                  },
                  {
                    Name: 'Load Balancers',
                    Status: 'Not Started',
                  },
                ],
              },
              {
                Name: 'Compute',

                Items: [
                  {
                    Name: 'VMware',
                    Status: 'Not Started',
                  },
                  {
                    Name: 'Solaris',
                    Status: 'Not Started',
                  },
                  {
                    Name: 'Physical',
                    Status: 'Not Started',
                  },
                ],
              },
              {
                Name: 'Mainframe',

                Items: [
                  {
                    Name: 'z/OS',
                    Status: 'Not Started',
                  },
                  {
                    Name: 'z/VM',
                    Status: 'Not Started',
                  },
                ],
              },
            ],
          },
          {
            Name: 'Operational',

            Subcategories: [
              {
                Name: 'Replication State',

                Items: [
                  {
                    Name: 'Replication',
                    Status: 'Not Started',
                  },
                ],
              },
              {
                Name: 'Failover',

                Items: [
                  {
                    Name: 'Failover State',
                    Status: 'Not Started',
                  },
                ],
              },
            ],
          },
        ],
      },
      // {
      //   Name: 'VDC2',
      //   StatusProgress: 30,
      //   StatusText: 'DataProtection',
      //   Categories: [
      //     {
      //       Name: 'Onboarding',

      //       Subcategories: [
      //         {
      //           Name: 'Tenant Intialization',

      //           Items: [
      //             {
      //               Name: 'Networking',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'Security',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'CMDB',
      //               Status: 'Not Started',
      //             },
      //           ],
      //         },
      //         {
      //           Name: 'User Management',

      //           Items: [],
      //         },
      //       ],
      //     },
      //     {
      //       Name: 'Configuring Datacenter',
      //       HasError: false,
      //       HasWarning: true,
      //       Subcategories: [
      //         {
      //           Name: 'Data Protection',

      //           Items: [
      //             {
      //               Name: 'Spectrum Protect',
      //               Status: 'In Progress',
      //             },
      //             {
      //               Name: 'Actifio',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'SFTP',
      //               Status: 'Completed',
      //             },
      //           ],
      //         },
      //         {
      //           Name: 'Networking',

      //           Items: [
      //             {
      //               Name: 'Subnets',
      //               Status: 'Not Started',
      //               Link: '/networks',
      //             },
      //             {
      //               Name: 'Routing',
      //               Link: 'static-routes',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'Firewall Rules',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'Load Balancers',
      //               Status: 'Not Started',
      //             },
      //           ],
      //         },
      //         {
      //           Name: 'Compute',

      //           Items: [
      //             {
      //               Name: 'VMware',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'Solaris',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'Physical',
      //               Status: 'Not Started',
      //             },
      //           ],
      //         },
      //         {
      //           Name: 'Mainframe',

      //           Items: [
      //             {
      //               Name: 'z/OS',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'z/VM',
      //               Status: 'Not Started',
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //     {
      //       Name: 'Operational',

      //       Subcategories: [
      //         {
      //           Name: 'Replication',
      //           Items: [],
      //         },
      //         {
      //           Name: 'Testing',
      //           Items: [],
      //         },
      //         {
      //           Name: 'Failover',
      //           Items: [],
      //         },
      //       ],
      //     },
      //   ],
      // },
      // {
      //   Name: 'VDC3',
      //   StatusProgress: 100,
      //   StatusText: 'Operational',
      //   Categories: [
      //     {
      //       Name: 'Onboarding',

      //       Subcategories: [
      //         {
      //           Name: 'Tenant Intialization',

      //           Items: [
      //             {
      //               Name: 'Networking',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'Security',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'CMDB',
      //               Status: 'Not Started',
      //             },
      //           ],
      //         },
      //         {
      //           Name: 'User Management',

      //           Items: [],
      //         },
      //       ],
      //     },
      //     {
      //       Name: 'Configuring Datacenter',

      //       Subcategories: [
      //         {
      //           Name: 'Data Protection',

      //           Items: [
      //             {
      //               Name: 'Spectrum Protect',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'Actifio',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'SFTP',
      //               Status: 'Not Started',
      //             },
      //           ],
      //         },
      //         {
      //           Name: 'Networking',

      //           Items: [
      //             {
      //               Name: 'Subnets',
      //               Link: '/networks',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'Routing',
      //               Link: 'static-routes',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'Firewall Rules',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'Load Balancers',
      //               Status: 'Not Started',
      //             },
      //           ],
      //         },
      //         {
      //           Name: 'Compute',

      //           Items: [
      //             {
      //               Name: 'VMware',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'Solaris',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'Physical',
      //               Status: 'Not Started',
      //             },
      //           ],
      //         },
      //         {
      //           Name: 'Mainframe',

      //           Items: [
      //             {
      //               Name: 'z/OS',
      //               Status: 'Not Started',
      //             },
      //             {
      //               Name: 'z/VM',
      //               Status: 'Not Started',
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //     {
      //       Name: 'Operational',

      //       Subcategories: [
      //         {
      //           Name: 'Replication State',

      //           Items: [
      //             {
      //               Name: 'Replication',
      //               Status: 'In Progress',
      //             },
      //           ],
      //         },
      //         {
      //           Name: 'Failover',

      //           Items: [
      //             {
      //               Name: 'Failover State',
      //               Status: 'Completed',
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //   ],
      // },
    ];
  }
}
