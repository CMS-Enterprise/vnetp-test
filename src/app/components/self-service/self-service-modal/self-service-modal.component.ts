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
  mappedInterfacesToHostnames = [];
  vsysHolderArray = [];
  zoneHolderArray = [];

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

  xml2json(xml) {
    try {
      var obj = {};
      if (xml.children.length > 0) {
        for (var i = 0; i < xml.children.length; i++) {
          var item = xml.children.item(i);
          var nodeName = item.nodeName;

          if (xml.nodeName === 'vsys') {
            const vsysName = item.attributes[0].value;
            this.vsysHolderArray.push(vsysName);
          }

          if (xml.nodeName === 'zone') {
            const zoneName = item.attributes[0].value;
            this.zoneHolderArray.push(zoneName);
          }

          if (typeof obj[nodeName] == 'undefined') {
            obj[nodeName] = this.xml2json(item);
          } else {
            if (typeof obj[nodeName].push == 'undefined') {
              var old = obj[nodeName];

              obj[nodeName] = [];
              obj[nodeName].push(old);
            }
            obj[nodeName].push(this.xml2json(item));
          }
        }
      } else {
        obj = xml.textContent;
      }
      return obj;
    } catch (e) {
      console.log(e.message);
    }
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
    const selectedTiers = this.f.selectedTiersFromConfig.value;
    console.log('selectedTiers', selectedTiers);
    console.log('mappedInterfaces', this.mappedInterfacesToHostnames);
    this.mappedInterfacesToHostnames.map(int => {
      if (!selectedTiers.includes(int.hostname)) {
        this.mappedInterfacesToHostnames.splice(this.mappedInterfacesToHostnames.indexOf(int));
      }
    });
    console.log('mappedInterfaces', this.mappedInterfacesToHostnames);
    // find union between selectedTiers and mappedHostnamesWithInterfaces
    // console.log('this.cf', this.cf);
    this.tiersSaved = true;
    this.initialForm.controls.selectedTiersFromConfig.disable();
    this.continuedForm = this.formBuilder.group({
      selectedTiers: [this.mappedInterfacesToHostnames],
    });
    console.log('this.cf', this.cf);
  }

  public saveNameSpaces() {
    console.log('this.cf', this.cf);
  }

  public markInterfaceIntervrf(int) {
    int.intervrf = true;
    int.external = false;
    return int;
  }

  public markInterfaceExternal(int) {
    int.external = true;
    int.intervrf = false;
    int.inside = false;
    return int;
  }

  public markInterfaceInside(int) {
    int.intervrf = true;
    int.inside = true;
    int.external = false;
    return int;
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
        const zoneRegex = /zone(.*)/g;
        const zones = readableText.match(zoneRegex);
        const parsed = parser.parseFromString(readableText, 'text/xml');
        const json: any = this.xml2json(parsed);
        console.log('json', json);
        const vsysArrayFromConfig = json.config.devices.entry.vsys.entry;
        for (let i = 0; i < vsysArrayFromConfig.length; i++) {
          vsysArrayFromConfig[i].name = this.vsysHolderArray[i];
        }
        vsysArrayFromConfig.map(vsys => {
          vsys.zones = [];
          const numOfZones = vsys.zone.entry.length;

          // close
          // need to pop off elements as they move from one array to another
          for (let i = 0; i < numOfZones; i++) {
            vsys.zones.push(this.zoneHolderArray[i]);
          }
        });
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
        const securityZones = [];
        const vsysValueArray = [];
        entryArray.map(entry => {
          const zoneChildren = entry.childNodes[13].children;
          // for (let i = 0; i < zoneChildren.length; i++) {
          //   securityZones.push(zoneChildren[i].attributes[0].value)
          // }
          const vsysName = entry.attributes[0].value;
          vsysValueArray.push(vsysName);
          this.mappedInterfacesToHostnames.push({ hostname: vsysName, interfaces: securityZones });
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

          // get index (line number) of the hostname in the ASA config file
          if (hostnameIndex !== -1) {
            hostname = hostname.split(' ')[1];
            hostnameIndexes.push({ hostname: hostname, hostnameIndex: hostnameIndex });
          }
        });

        // issue :
        // if there are duplicate values in the interfaces array
        // we must find a way to get each unique index of the interfaces
        // indexOf only returns the first matching instance found and ignores others
        // we must run the first instance of any duplicate entries to get their index
        // so we can use that index as an offset to get the next matching instance

        // strip any duplicate entries from the collected interfaces
        const uniqueIndexes = [...new Set(interfaces)];

        // pass each interface to a function that will recursively get the index for the interfaces
        uniqueIndexes.map(int => {
          this.recursivelyGetIndexes(int, splitFileByLine);
        });

        this.tiersFromConfig = hostnameIndexes.map(hostnameIndex => {
          return hostnameIndex.hostname;
        });
        this.mappedInterfacesToHostnames = this.interfaceMatrixHelper(hostnameIndexes, this.storedInterfaces, splitFileByLine.length);
        console.log('mappedEverything', this.mappedInterfacesToHostnames);
      }
    };
  }

  //psuedo :
  // take the value, find the index in the string
  // if there are multiple entries with the same value
  // pass the same args to the function this time providing an offset
  // the offset is the index found in the initial function run
  // the offset will also be the index each time a duplicate interface is encountered
  // this ensures we are always checking the NEXT instance of an interface match
  private recursivelyGetIndexes(val, file, offset?) {
    // if we've already encountered an interface match, we use the offset
    // which is the index of that interface match to give us our starting point
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

  // helper function for building the interface matrix
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
    this.storedInterfaces = [];
    this.mappedInterfacesToHostnames = [];
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
