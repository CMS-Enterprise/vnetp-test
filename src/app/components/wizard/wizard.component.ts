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
                    Name: 'Subnet 1',
                    Status: WizardStatus.Up
                  },
                  {
                    Name: 'Subnet 2',
                    Status: WizardStatus.Up
                  },
                  {
                    Name: 'Subnet 3',
                    Status: WizardStatus.Warning
                  }
                ]
              },
            ]
          },
          {
            Name: 'Load Balancers',
            Status: WizardStatus.Up,
            Subcategories: []
          },
          {
            Name: 'Firewall Rules',
            Status: WizardStatus.Warning,
            Subcategories: []
          },
          {
            Name: 'Data',
            Status: WizardStatus.Down,
            Subcategories: []
          }
        ]
      },
      {
      Name: 'Test',
      Status: WizardStatus.Down,
      Categories: [
        {
          Name: 'Automated Tests',
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
    console.log(this.WizardSections);
  }
}
