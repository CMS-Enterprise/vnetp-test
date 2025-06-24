import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PanosApplication } from '../../../../../client';

@Component({
  selector: 'app-panos-application-details-dialog',
  templateUrl: './panos-application-details-dialog.component.html',
  styleUrls: ['./panos-application-details-dialog.component.css'],
})
export class PanosApplicationDetailsDialogComponent implements OnInit {
  @Input() data: PanosApplication;
  @Input() compactMode = false;
  firewallRuleGroupId: string;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public dialogData: { app: PanosApplication; firewallRuleGroupId: string }) {}

  ngOnInit(): void {
    if (!this.data && this.dialogData) {
      this.data = this.dialogData.app;
      this.firewallRuleGroupId = this.dialogData?.firewallRuleGroupId;
    }
  }
}
