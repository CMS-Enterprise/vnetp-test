import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tier, V1DatacentersService, V1TiersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';

@Component({
  selector: 'app-self-service-modal',
  templateUrl: './self-service-modal.component.html',
})
export class SelfServiceModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  tiers: Tier[];
  selectedTier: Tier;
  datacenterId;
  vsysArray = [];

  private currentDatacenterSubscription: Subscription;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private datacenterService: V1DatacentersService,
    private datacenterContextService: DatacenterContextService,
  ) {}

  get f() {
    return this.form.controls;
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      deviceType: ['', Validators.required],
      tierSelect: ['', Validators.required],
      deviceConfig: ['', Validators.required],
      intervrfSubnets: [''],
    });
  }

  public getTiers(): void {
    this.datacenterService
      .getOneDatacenters({
        id: this.datacenterId,
        join: ['tiers'],
      })
      .subscribe(data => {
        this.tiers = data?.tiers?.filter(t => !t.deletedAt) ?? [];
      });
  }

  public deviceConfigFileChange(event) {
    const reader = new FileReader();
    const file = event.target.files[0];
    reader.readAsText(file);
    reader.onload = () => {
      const readableText = reader.result.toString();
      console.log('readableText', readableText);
      const deviceType = this.form.controls.deviceType.value;
      if (deviceType === 'PA') {
        const parser = new DOMParser();
        const parsed = parser.parseFromString(readableText, 'text/xml');
        console.log('parsed', parsed);
        // this.parseAll(all);
        // console.log('this.vsysArray', this.vsysArray);
        // const children = parsed.children;
        // console.log('children', children);
        // iterate through all childNodes
        // const childNodes = parsed.childNodes;
        // this.getAllChildNodes(childNodes);
        // console.log('this.childNodes', this.childNodes);
      }
    };
  }

  public intervrfSubnetsFileChange(event) {
    console.log('event', event);
  }

  ngOnInit() {
    this.buildForm();
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.datacenterId = cd.id;
        this.getTiers();
      }
    });
  }
}
