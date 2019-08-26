import { Component, OnInit, Input } from '@angular/core';
import { WizardSection, WizardStatus } from 'src/app/models/wizard/wizard-data';
import { AppMessage } from 'src/app/models/app-message';
import { MessageService } from 'src/app/services/message.service';
import { Subscription } from 'rxjs';
import { AppMessageType } from 'src/app/models/app-message-type';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css']
})
export class WizardComponent implements OnInit {

  showWizard = true;
  WizardSections = new Array<WizardSection>();
  WizardProgress = 50;
  messageServiceSubscription: Subscription;
  messageService: MessageService;

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

  getMessageServiceSubscription() {
    this.messageServiceSubscription = this.messageService
      .listen()
      .subscribe((m: AppMessage) => {
        this.messageHandler(m);
      });
  }

  private messageHandler(m: AppMessage) {
    switch (m.Type) {
      case AppMessageType.ToggleWizard:
        this.showWizard = !this.showWizard;
    }
  }

  ngOnInit() {
    this.WizardSections = [
      {
        Name: 'CDS',
        Status: WizardStatus.Down,
        Categories: [
          {
            Name: 'Onboarding',
            Status: WizardStatus.Warning,
            Subcategories: [
              {
                Name: 'Tenant Intialization',
                Status: WizardStatus.Warning,
                Items: [
                  {
                    Name: 'Networking',
                    Status: WizardStatus.Warning,
                  },
                  {
                    Name: 'Security',
                    Status: WizardStatus.Warning,
                  },
                  {
                    Name: 'CMDB',
                    Status: WizardStatus.Up
                  }
                ]
              },
              {
                Name: 'User Management',
                Status: WizardStatus.Up,
                Items: [
                ]
              }
            ]
          },
          {
            Name: 'Define Source Datacenter',
            Status: WizardStatus.Down,
            Subcategories: [
              {
                Name: 'Data Protection',
                Status: WizardStatus.Down,
                Items: [
                  {
                    Name: 'Spectrum Protect',
                    Status: WizardStatus.Down,
                  },
                  {
                    Name: 'Actifio',
                    Status: WizardStatus.Down
                  },
                  {
                    Name: 'SFTP',
                    Status: WizardStatus.Up
                  }
                ]
              },
              {
                Name: 'Networking',
                Status: WizardStatus.Up,
                Items: [
                  {
                    Name: 'Subnets',
                    Status: WizardStatus.Up
                  },
                  {
                    Name: 'Routing',
                    Status: WizardStatus.Up
                  },
                  {
                    Name: 'Firewall Rules',
                    Status: WizardStatus.Up
                  },
                  {
                    Name: 'Load Balancers',
                    Status: WizardStatus.Up
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    this.getMessageServiceSubscription();
  }
}
