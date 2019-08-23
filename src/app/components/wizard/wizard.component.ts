import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css']
})
export class WizardComponent implements OnInit {

  @Input() showWizard: boolean;

  constructor() { }

  ngOnInit() {
  }

}
