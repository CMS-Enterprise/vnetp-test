import { Component, OnInit } from '@angular/core';
import { SolarisCdom } from '../../../models/solaris-cdom';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-solaris-cdom-create',
  templateUrl: './solaris-cdom-create.component.html',
  styleUrls: ['./solaris-cdom-create.component.css']
})
export class SolarisCdomCreateComponent implements OnInit {
  cdom: SolarisCdom
  constructor(
    private automationApiService: AutomationApiService
  ){
  
  }

  ngOnInit() {
  }
  createCDOM(){
    // this.automationApiService.doqlQuery()
  }
}
