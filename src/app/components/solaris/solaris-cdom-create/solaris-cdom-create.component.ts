import { Component, OnInit } from '@angular/core';
import { SolarisCdom } from '../../../models/solaris-cdom';

@Component({
  selector: 'app-solaris-cdom-create',
  templateUrl: './solaris-cdom-create.component.html',
  styleUrls: ['./solaris-cdom-create.component.css']
})
export class SolarisCdomCreateComponent implements OnInit {
  cdom: SolarisCdom

  constructor() { }

  ngOnInit() {
  }

}
