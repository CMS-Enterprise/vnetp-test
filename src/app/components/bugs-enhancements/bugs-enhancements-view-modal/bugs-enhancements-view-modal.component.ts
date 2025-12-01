import { Component, Input, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-bugs-enhancements-view-modal',
  templateUrl: './bugs-enhancements-view-modal.component.html',
})
export class BugsEnhancementsViewModalComponent {
  @ViewChild('propertiesTemplate') propertiesTemplate: TemplateRef<any>;
  @ViewChild('propertiesTemplate2') propertiesTemplate2: TemplateRef<any>;
  @Input() mail;
  changedProperties: any;

  public changedPropsConfig = {
    columns: [
      {
        name: 'Helpful',
        property: 'mailBody',
      },
      {
        name: 'To',
        property: 'toEmail',
      },
      {
        name: 'Benefits',
        property: 'benefits',
      },
      {
        name: 'User Email',
        property: 'userEmail',
      },
      {
        name: 'Enhancement',
        property: 'enhancement',
      },
      {
        name: 'Current Behavior',
        property: 'whatIsItDoing',
      },
    ],
  };
  public config = {
    description: 'Detailed Audit Log Entry',
    columns: [
      {
        name: 'Mail Body Properties',
        template: () => this.propertiesTemplate2,
      },
      // {
      //   name: 'Mail Status',
      //   property: 'status',
      // },
      // {
      //   name: 'Helpful',
      //   property: 'mailBody',
      // },
      // {
      //   name: 'To',
      //   property: 'toEmail',
      // },
      // {
      //   name: 'Benefits',
      //   property: 'benefits',
      // },
      //  {
      //   name: 'User Email',
      //   property: 'userEmail',
      // },
      //  {
      //   name: 'Enhancement',
      //   property: 'enhancement',
      // },
      //  {
      //   name: 'Current Behavior',
      //   property: 'whatIsItDoing',
      // },
      // {
      //   name: 'Values Changed',
      //   template: () => this.propertiesTemplate,
      // },
    ],
  };
}
