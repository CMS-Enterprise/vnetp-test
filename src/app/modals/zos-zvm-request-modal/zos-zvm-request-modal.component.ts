import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-zos-zvm-request-modal',
  templateUrl: './zos-zvm-request-modal.component.html',
  styleUrls: ['./zos-zvm-request-modal.component.css'],
})
export class ZosZvmRequestModalComponent implements OnInit {
  form: FormGroup;

  constructor() {}

  save() {
    console.log('request type:');
  }

  ngOnInit() {}
}
