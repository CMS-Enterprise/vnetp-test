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
  initialForm: FormGroup;
  continuedForm: FormGroup;
  submitted: boolean;
  tiers: Tier[];
  selectedTier: Tier;
  datacenterId;
  tiersFromConfig = [];
  selectedTiers;
  tiersSaved: boolean;
  storedInterfaces = [];

  private currentDatacenterSubscription: Subscription;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private datacenterService: V1DatacentersService,
    private datacenterContextService: DatacenterContextService,
    private selfServiceService: V1SelfServiceService,
  ) {}

  get f() {
    return this.initialForm.controls;
  }

  get cf() {
    return this.continuedForm.controls;
  }

  private buildForm() {
    this.initialForm = this.formBuilder.group({
      deviceType: ['', Validators.required],
      DCSTierSelect: ['', Validators.required],
      deviceConfig: ['', Validators.required],
      intervrfSubnets: [''],
      selectedTiersFromConfig: ['', Validators.required],
    });
  }

  public saveTiers() {
    console.log('this.form', this.initialForm);
    this.tiersSaved = true;
    this.initialForm.controls.selectedTiersFromConfig.disable();
    this.continuedForm = this.formBuilder.group({
      selectedTiers: [this.initialForm.controls.selectedTiersFromConfig.value],
    });
  }

  public saveNameSpaces() {
    const grouped = document.getElementsByClassName('custom');
    const groupedArray = [];
    for (let i = 0; i < grouped.length; i++) {
      groupedArray.push(grouped[i]);
    }
    const mappedObjectsArray = [];
    groupedArray.map(group => {
      const populateThisObject = { tierName: '', nameSpace: '' };
      populateThisObject.tierName = group.textContent;
      populateThisObject.nameSpace = group.lastChild.value;
      mappedObjectsArray.push(populateThisObject);
    });
    console.log('mappedObjectsArray', mappedObjectsArray);
  }

  public extractInterfaceMatrix() {}

  public addFormControlToListItem() {
    console.log('this.form', this.initialForm);
    //.forEach((moveMaker ) => this.moveMakerForm .addControl(moveMaker.id, new FormControl('', Validators.required)));
    const selectedTiersFromConfig: [] = this.initialForm.controls.selectedTiersFromConfig.value
      ? this.initialForm.controls.selectedTiersFromConfig.value
      : null;
    if (selectedTiersFromConfig === null) {
      return;
    }
    selectedTiersFromConfig.forEach(selectedTierFromConfig => {
      let i = '1';
      console.log('selectedTierFromConfig', selectedTierFromConfig);
      return this.initialForm.addControl(selectedTierFromConfig, new FormControl('', Validators.required));
    });
    console.log('this.form', this.initialForm);
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
    this.initialForm.controls.deviceType.disable();
    this.initialForm.controls.DCSTierSelect.disable();
    const reader = new FileReader();
    const file = event.target.files[0];
    reader.readAsText(file);
    reader.onload = () => {
      const readableText = reader.result.toString();
      const deviceType = this.initialForm.controls.deviceType.value;
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
        const splitFileByLine = readableText.split('\n');
        const hostnameRegex = /hostname(.*)/g;
        const nameifRegex = /nameif(.*)/g;
        const hostnames = readableText.match(hostnameRegex);
        const interfaces = readableText.match(nameifRegex);
        const hostnameIndexes = [];
        hostnames.map(hostname => {
          const hostnameIndex = splitFileByLine.indexOf(hostname + '\r');
          if (hostnameIndex !== -1) {
            hostnameIndexes.push({ hostname: hostname, hostnameIndex: hostnameIndex });
          }
        });

        // issue :
        // if there are duplicate values in the interfaces array
        // we must find a way to get each unique index of the interfaces
        // indexOf only returns the first matching instance found and ignores others
        // we must run the first instance of any duplicate entries to get their index
        // so we can use that index as an offset to get the next matching instance

        const uniqueIndexes = [...new Set(interfaces)];

        uniqueIndexes.map(int => {
          this.recursivelyGetIndexes(int, splitFileByLine);
        });
        hostnameIndexes.map(host => {
          host.hostname = host.hostname.split(' ')[1];
        });
        this.tiersFromConfig = hostnameIndexes.map(hostnameIndex => {
          return hostnameIndex.hostname;
        });
        const mappedEverything = this.interfaceMatrixHelper(hostnameIndexes, this.storedInterfaces, splitFileByLine.length);
        console.log('mappedEverything', mappedEverything);
      }
    };
  }

  //psuedo :
  // take the value, find the index in the string
  // if there are multiple entries with the same value
  // pass the same args to the function this time providing an offset
  // the offset is the index found in the initial function run
  private recursivelyGetIndexes(val, file, offset?) {
    if (offset) {
      const index = file.indexOf(' ' + val + '\r', offset + 1);
      if (index !== -1) {
        this.storedInterfaces.push({ interface: val, index: index });
        this.recursivelyGetIndexes(val, file, index);
      } else {
        return;
      }
    } else {
      const index = file.indexOf(' ' + val + '\r');
      if (index !== -1) {
        this.storedInterfaces.push({ interface: val, index: index });
        this.recursivelyGetIndexes(val, file, index);
      } else {
        return;
      }
    }
  }

  private interfaceMatrixHelper(hostnamesWithIndex, interfacesWithIndex, eof) {
    for (let i = 0; i < hostnamesWithIndex.length; i++) {
      const range = { min: '', max: '' };
      range.min = hostnamesWithIndex[i].hostnameIndex;
      if (hostnamesWithIndex[i + 1]) {
        range.max = hostnamesWithIndex[i + 1].hostnameIndex;
      } else {
        range.max = eof;
      }
      hostnamesWithIndex[i].range = range;
    }
    hostnamesWithIndex.map(host => {
      host.interfaces = [];
      interfacesWithIndex.map(int => {
        if (int.index > host.range.min && int.index < host.range.max) {
          host.interfaces.push(int);
        }
      });
    });
    return hostnamesWithIndex;
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
    this.tiersSaved = false;
    this.initialForm.reset();
    this.initialForm.enable();
    this.continuedForm.reset();
    this.continuedForm.enable();
    console.log('this.form', this.initialForm);
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
