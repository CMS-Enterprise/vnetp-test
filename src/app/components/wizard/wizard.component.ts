import { Component, OnInit, Input } from '@angular/core';
import { WizardSection } from 'src/app/models/wizard/wizard-data';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css']
})
export class WizardComponent implements OnInit {
  WizardSections = new Array<WizardSection>();
  WizardProgress = 50;

  constructor() {}

  getProgressBarPercentage(statusProgress: number) {
    return `${statusProgress}%`;
  }

  ngOnInit() {
    this.WizardSections = [
      {
        Name: 'VDC1',
        StatusText: 'Defining',
        StatusProgress: 10,
        Categories: [
          {
            Name: 'Onboarding',

            Subcategories: [
              {
                Name: 'Tenant Intialization',

                Items: [
                  {
                    Name: 'Networking'
                  },
                  {
                    Name: 'Security'
                  },
                  {
                    Name: 'CMDB'
                  }
                ]
              },
              {
                Name: 'User Management',

                Items: []
              }
            ]
          },
          {
            Name: 'Configuring Datacenter',

            Subcategories: [
              {
                Name: 'Data Protection',

                Items: [
                  {
                    Name: 'Spectrum Protect'
                  },
                  {
                    Name: 'Actifio'
                  },
                  {
                    Name: 'SFTP'
                  }
                ]
              },
              {
                Name: 'Networking',
                Items: [
                  {
                    Name: 'Subnets',
                    Link: '/networks'
                  },
                  {
                    Name: 'Routing',
                    Link: 'static-routes'
                  },
                  {
                    Name: 'Firewall Rules'
                  },
                  {
                    Name: 'Load Balancers'
                  }
                ]
              },
              {
                Name: 'Compute',

                Items: [
                  {
                    Name: 'VMware'
                  },
                  {
                    Name: 'Solaris'
                  },
                  {
                    Name: 'Physical'
                  }
                ]
              },
              {
                Name: 'Mainframe',

                Items: [
                  {
                    Name: 'z/OS'
                  },
                  {
                    Name: 'z/VM'
                  }
                ]
              }
            ]
          },
          {
            Name: 'Operational',

            Subcategories: [
              {
                Name: 'Replication',
                Items: []
              },
              {
                Name: 'Testing',
                Items: []
              },
              {
                Name: 'Failover',
                Items: []
              }
            ]
          }
        ]
      },
      {
        Name: 'VDC2',
        StatusProgress: 30,
        StatusText: 'DataProtection',
        Categories: [
          {
            Name: 'Onboarding',

            Subcategories: [
              {
                Name: 'Tenant Intialization',

                Items: [
                  {
                    Name: 'Networking'
                  },
                  {
                    Name: 'Security'
                  },
                  {
                    Name: 'CMDB'
                  }
                ]
              },
              {
                Name: 'User Management',

                Items: []
              }
            ]
          },
          {
            Name: 'Configuring Datacenter',

            Subcategories: [
              {
                Name: 'Data Protection',

                Items: [
                  {
                    Name: 'Spectrum Protect'
                  },
                  {
                    Name: 'Actifio'
                  },
                  {
                    Name: 'SFTP'
                  }
                ]
              },
              {
                Name: 'Networking',

                Items: [
                  {
                    Name: 'Subnets',

                    Link: '/networks'
                  },
                  {
                    Name: 'Routing',

                    Link: 'static-routes'
                  },
                  {
                    Name: 'Firewall Rules'
                  },
                  {
                    Name: 'Load Balancers'
                  }
                ]
              },
              {
                Name: 'Compute',

                Items: [
                  {
                    Name: 'VMware'
                  },
                  {
                    Name: 'Solaris'
                  },
                  {
                    Name: 'Physical'
                  }
                ]
              },
              {
                Name: 'Mainframe',

                Items: [
                  {
                    Name: 'z/OS'
                  },
                  {
                    Name: 'z/VM'
                  }
                ]
              }
            ]
          },
          {
            Name: 'Operational',

            Subcategories: [
              {
                Name: 'Replication',
                Items: []
              },
              {
                Name: 'Testing',
                Items: []
              },
              {
                Name: 'Failover',
                Items: []
              }
            ]
          }
        ]
      },
      {
        Name: 'VDC3',
        StatusProgress: 100,
        StatusText: 'Operational',
        Categories: [
          {
            Name: 'Onboarding',

            Subcategories: [
              {
                Name: 'Tenant Intialization',

                Items: [
                  {
                    Name: 'Networking'
                  },
                  {
                    Name: 'Security'
                  },
                  {
                    Name: 'CMDB'
                  }
                ]
              },
              {
                Name: 'User Management',

                Items: []
              }
            ]
          },
          {
            Name: 'Configuring Datacenter',

            Subcategories: [
              {
                Name: 'Data Protection',

                Items: [
                  {
                    Name: 'Spectrum Protect'
                  },
                  {
                    Name: 'Actifio'
                  },
                  {
                    Name: 'SFTP'
                  }
                ]
              },
              {
                Name: 'Networking',

                Items: [
                  {
                    Name: 'Subnets',
                    Link: '/networks'
                  },
                  {
                    Name: 'Routing',
                    Link: 'static-routes'
                  },
                  {
                    Name: 'Firewall Rules'
                  },
                  {
                    Name: 'Load Balancers'
                  }
                ]
              },
              {
                Name: 'Compute',

                Items: [
                  {
                    Name: 'VMware'
                  },
                  {
                    Name: 'Solaris'
                  },
                  {
                    Name: 'Physical'
                  }
                ]
              },
              {
                Name: 'Mainframe',

                Items: [
                  {
                    Name: 'z/OS'
                  },
                  {
                    Name: 'z/VM'
                  }
                ]
              }
            ]
          },
          {
            Name: 'Operational',

            Subcategories: [
              {
                Name: 'Replication',

                Items: []
              },
              {
                Name: 'Testing',

                Items: []
              },
              {
                Name: 'Failover',

                Items: []
              }
            ]
          }
        ]
      }
    ];
  }
}
