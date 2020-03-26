export const wizardSections = [
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
                Name: 'Networking',
                Status: 'Not Started',
              },
              {
                Name: 'Security',
                Status: 'Not Started',
              },
              {
                Name: 'CMDB',
                Status: 'Not Started',
              },
            ],
          },
          {
            Name: 'User Management',

            Items: [],
          },
        ],
      },
      {
        Name: 'Configuring Datacenter',
        HasError: false,
        HasWarning: true,
        Subcategories: [
          {
            Name: 'Data Protection',

            Items: [
              {
                Name: 'Spectrum Protect',
                Status: 'In Progress',
              },
              {
                Name: 'Actifio',
                Status: 'Not Started',
              },
              {
                Name: 'SFTP',
                Status: 'Completed',
              },
            ],
          },
          {
            Name: 'Networking',

            Items: [
              {
                Name: 'Subnets',
                Status: 'Not Started',
                Link: '/networks',
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
            Name: 'Replication',
            Items: [],
          },
          {
            Name: 'Testing',
            Items: [],
          },
          {
            Name: 'Failover',
            Items: [],
          },
        ],
      },
    ],
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
                Name: 'Networking',
                Status: 'Not Started',
              },
              {
                Name: 'Security',
                Status: 'Not Started',
              },
              {
                Name: 'CMDB',
                Status: 'Not Started',
              },
            ],
          },
          {
            Name: 'User Management',

            Items: [],
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
                Status: 'In Progress',
              },
            ],
          },
          {
            Name: 'Failover',

            Items: [
              {
                Name: 'Failover State',
                Status: 'Completed',
              },
            ],
          },
        ],
      },
    ],
  },
];
