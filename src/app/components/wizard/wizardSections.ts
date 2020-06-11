export const wizardSections = [
  {
    Categories: [
      {
        HasError: false,
        HasWarning: false,
        Name: 'Onboarding',
        Subcategories: [
          {
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
            Name: 'Tenant Intialization',
          },
          {
            Items: [
              {
                Name: 'Create Users',
                Status: 'In Progress',
              },
            ],
            Name: 'User Management',
          },
        ],
      },
      {
        Name: 'Configuring Datacenter',

        Subcategories: [
          {
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
            Name: 'Data Protection',
          },
          {
            Items: [
              {
                Link: '/networks',
                Name: 'Subnets',
                Status: 'Not Started',
              },
              {
                Link: 'static-routes',
                Name: 'Routing',
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
            Name: 'Networking',
          },
          {
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
            Name: 'Compute',
          },
          {
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
            Name: 'Mainframe',
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
    Name: 'VDC1',
    StatusProgress: 10,
    StatusText: 'Defining',
  },
  {
    Categories: [
      {
        Name: 'Onboarding',
        Subcategories: [
          {
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
            Name: 'Tenant Intialization',
          },
          {
            Items: [],
            Name: 'User Management',
          },
        ],
      },
      {
        HasError: false,
        HasWarning: true,
        Name: 'Configuring Datacenter',
        Subcategories: [
          {
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
            Name: 'Data Protection',
          },
          {
            Items: [
              {
                Link: '/networks',
                Name: 'Subnets',
                Status: 'Not Started',
              },
              {
                Link: 'static-routes',
                Name: 'Routing',
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
            Name: 'Networking',
          },
          {
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
            Name: 'Compute',
          },
          {
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
            Name: 'Mainframe',
          },
        ],
      },
      {
        Name: 'Operational',
        Subcategories: [
          {
            Items: [],
            Name: 'Replication',
          },
          {
            Items: [],
            Name: 'Testing',
          },
          {
            Items: [],
            Name: 'Failover',
          },
        ],
      },
    ],
    Name: 'VDC2',
    StatusProgress: 30,
    StatusText: 'DataProtection',
  },
  {
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
            Items: [],
            Name: 'User Management',
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
                Link: '/networks',
                Name: 'Subnets',
                Status: 'Not Started',
              },
              {
                Link: 'static-routes',
                Name: 'Routing',
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
    Name: 'VDC3',
    StatusProgress: 100,
    StatusText: 'Operational',
  },
];
