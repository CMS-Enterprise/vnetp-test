import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Tier, V1DatacentersService, V1SelfServiceService, V1TiersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';

@Component({
  selector: 'app-self-service-modal',
  templateUrl: './self-service-modal.component.html',
})
export class SelfServiceModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  tiers: Tier[];
  selectedTier: Tier;
  datacenterId;
  tiersFromConfig = [];
  selectedTiers;
  nameSpaces;

  private currentDatacenterSubscription: Subscription;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private datacenterService: V1DatacentersService,
    private datacenterContextService: DatacenterContextService,
    private selfServiceService: V1SelfServiceService,
  ) {}

  get f() {
    return this.form.controls;
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      deviceType: ['', Validators.required],
      DCSTierSelect: ['', Validators.required],
      deviceConfig: ['', Validators.required],
      intervrfSubnets: [''],
      selectedTiersFromConfig: ['', Validators.required],
    });
  }

  public saveNameSpaces() {
    console.log('this.form', this.form);
    console.log('this.nameSpaces', this.nameSpaces);
  }

  public addFormControlToListItem() {
    console.log('this.form', this.form);
    //.forEach((moveMaker ) => this.moveMakerForm .addControl(moveMaker.id, new FormControl('', Validators.required)));
    const selectedTiersFromConfig: [] = this.form.controls.selectedTiersFromConfig.value
      ? this.form.controls.selectedTiersFromConfig.value
      : null;
    if (selectedTiersFromConfig === null) {
      return;
    }
    selectedTiersFromConfig.forEach(selectedTierFromConfig => {
      let i = '1';
      console.log('selectedTierFromConfig', selectedTierFromConfig);
      return this.form.addControl(selectedTierFromConfig, new FormControl('', Validators.required));
    });
    console.log('this.form', this.form);
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
    this.form.controls.deviceType.disable();
    this.form.controls.DCSTierSelect.disable();
    const reader = new FileReader();
    const file = event.target.files[0];
    reader.readAsText(file);
    reader.onload = () => {
      const readableText = reader.result.toString();
      const deviceType = this.form.controls.deviceType.value;
      if (deviceType === 'PA') {
        const parser = new DOMParser();
        const parsed = parser.parseFromString(readableText, 'text/xml');
        const childNodes = parsed.childNodes[0];
        const devices = childNodes.childNodes[5];
        const entry = devices.childNodes[1];
        const vsys = entry.childNodes[5];
        const entries = vsys.childNodes;
        const entryArray = [];
        for (let i = 0; i < entries.length; i++) {
          if (i % 2 === 0) {
            continue;
          } else {
            entryArray.push(entries[i]);
          }
        }
        const vsysValueArray = [];
        entryArray.map(entry => {
          vsysValueArray.push(entry.attributes[0].value);
        });
        this.tiersFromConfig = vsysValueArray;
      }

      // use regex to search for hostname for ASA configs
      if (deviceType === 'ASA') {
        const regex = /hostname(.*)/g;
        const hostnames = readableText.match(regex);
        const hostnameValues = [];
        hostnames.map(host => {
          if (!host.includes(' ')) {
            const index = hostnames.indexOf(host);
            hostnames.splice(index, 1);
          }
        });
        hostnames.map(host => {
          const hostnameVal = host.split(' ')[1];
          hostnameValues.push(hostnameVal);
        });
        // this.form.controls.extractedTiersFromConfig.setValue(hostnameValues);
        this.tiersFromConfig = hostnameValues;
      }
    };
  }

  public intervrfSubnetsFileChange(event) {
    console.log('event', event);
  }

  public onClose() {
    this.ngx.resetModalData('selfServiceModal');
    this.ngx.getModal('selfServiceModal').close();
    this.reset();
  }

  public reset() {
    this.selectedTier = null;
    this.tiersFromConfig = null;
    this.form.reset();
    this.form.enable();
    console.log('this.form', this.form);
  }

  public save() {}

  ngOnInit() {
    this.buildForm();
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.datacenterId = cd.id;
        this.getTiers();
      }
    });
  }

  ngOnDestroy(): void {
    this.reset();
  }
}
