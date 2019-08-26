import { Component, OnInit, Input } from '@angular/core';
import { WizardSection, WizardStatus } from 'src/app/models/wizard/wizard-data';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css']
})
export class WizardComponent implements OnInit {
  @Input() showWizard: boolean;

  WizardSections = new Array<WizardSection>();
  WizardProgress = 50;

  constructor() {}

  getFaName(status: WizardStatus) {
    switch (status) {
      case WizardStatus.Down:
        return 'times';
      case WizardStatus.Warning:
        return 'exclamation';
      case WizardStatus.Up:
        return 'check';
      default:
        return 'check';
    }
  }

  getProgressBarPercentage() {
    return `${this.WizardProgress}%`;
  }

  ngOnInit() {
    this.WizardSections = [
      {
        Name: 'Prepare',
        Status: WizardStatus.Down,
        Categories: [
          {
            Name: 'Networking',
            Status: WizardStatus.Warning,
            Subcategories: [
              {
                Name: 'Subnets',
                Status: WizardStatus.Warning,
                Items: [
                  {
                    Name: 'Subnet 3',
                    Status: WizardStatus.Warning,
                    Description: 'Subnet 3 only has 2 available IP addresses.'
                  }
                ]
              },
              {
                Name: 'Load Balancers',
                Status: WizardStatus.Up,
                Items: []
              },
              {
                Name: 'Firewall Rules',
                Status: WizardStatus.Warning,
                Items: [
                  {
                    Name: 'Intra-VRF Rules',
                    Status: WizardStatus.Warning,
                    Description: `No contracts have been created between subnets in this VRF,
                           this will prevent Intra-VRF communication between Subnets`
                  }
                ]
              }
            ]
          },
          {
            Name: 'Data',
            Status: WizardStatus.Down,
            Subcategories: [
              {
                Name: 'TSM Replication',
                Status: WizardStatus.Down,
                Items: [
                  {
                    Name: 'Replication State',
                    Status: WizardStatus.Down,
                    Description: 'Replication in failing state for 2h35m.'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        Name: 'Test',
        Status: WizardStatus.Down,
        Categories: [
          {
            Name: 'Tests',
            Status: WizardStatus.Down,
            Subcategories: []
          }
        ]
      },
      {
        Name: 'Deploy',
        Status: WizardStatus.Down,
        Categories: [
          {
            Name: 'Deployment Readiness',
            Status: WizardStatus.Down,
            Subcategories: []
          }
        ]
      }
    ];
  }
}
