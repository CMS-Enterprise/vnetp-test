import { Component, OnInit } from '@angular/core';
import { WizardSection } from 'src/app/models/wizard/wizard-data';
import { wizardSections } from './wizardSections';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent implements OnInit {
  WizardSections = new Array<WizardSection>();
  WizardProgress = 50;
  currentPanel: string;

  getSidePanel(param) {
    if (this.currentPanel === param) {
      this.currentPanel = '';
    } else {
      this.currentPanel = param;
    }
  }

  getProgressBarPercentage(statusProgress: number) {
    return `${statusProgress}%`;
  }

  ngOnInit() {
    // For all wizard sections remove [0]
    this.WizardSections = [wizardSections[0]];
  }
}
