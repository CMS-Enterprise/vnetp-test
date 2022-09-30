import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tier, V1DatacentersService, V1SelfServiceService, V1TiersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { SelfServiceModalHostWithInterfaces } from './self-service-modal-dtos/self-service-modal-host-with-interfaces-dto';
import { SelfServiceModalAsaInterfaceWithIndex } from './self-service-modal-dtos/self-service-modal-asa-interface-with-index-dto';

@Component({
  selector: 'app-self-service-modal',
  templateUrl: './self-service-modal.component.html',
})
export class SelfServiceModalComponent implements OnInit, OnDestroy {
  initialForm: FormGroup;
  continuedForm: FormGroup;
  submittedFirstForm: boolean;
  submittedSecondForm: boolean;
  showSecondForm: boolean;
  tiers: Tier[];
  datacenterId: string;
  tiersFromConfig: string[] = [];
  asaInterfacesWithIndex: SelfServiceModalAsaInterfaceWithIndex[] = [];
  hostsWithInterfaces: SelfServiceModalHostWithInterfaces[] = [];
  vsysHolderArray: string[] = [];
  zoneHolderArray: string[] = [];
  rawConfig;

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

  private buildForm(): void {
    this.initialForm = this.formBuilder.group({
      deviceType: ['', Validators.required],
      DCSTierSelect: ['', Validators.required],
      deviceConfig: ['', Validators.required],
      intervrfSubnets: [''],
      selectedTiersFromConfig: ['', Validators.required],
    });
  }

  // submits first form/locks the users selectedTiersFromConfig selections
  public saveTiers(): void {
    console.log('this.initialForm', this.initialForm);
    this.submittedFirstForm = true;
    if (this.initialForm.invalid) {
      this.showSecondForm = false;
      return;
    }
    this.showSecondForm = true;
    // find union between selectedTiers and mappedHostnamesWithInterfaces
    const selectedTiers = this.f.selectedTiersFromConfig.value;
    if (this.f.deviceType.value === 'ASA') {
      this.hostsWithInterfaces.map(host => {
        host.interfaces.map(int => {
          int.interface = int.interface.split(' ')[1];
          return int;
        });
      });
    }

    this.hostsWithInterfaces = this.hostsWithInterfaces.filter(host => {
      if (selectedTiers.includes(host.hostname)) {
        return host;
      }
    });
    // disable first form
    this.initialForm.controls.selectedTiersFromConfig.disable();

    // create second form using the value from the union we created above
    this.continuedForm = this.formBuilder.group({
      selectedTiers: [this.hostsWithInterfaces],
    });
  }

  // submits second form/locks the users interface selections
  public saveNameSpaces(): void {
    this.cf.selectedTiers.value.map(hostWithInterfaces => {
      // each host will have an interfaceMatrix
      const interfaceMatrix = { external: [], intervrf: [], insidePrefix: '' };

      // we build the interfaceMatrix based on the users check box values in the continued form

      let oneInsidePrefix = false;
      hostWithInterfaces.interfaces.map(int => {
        if (!int.inside && !int.outside) {
          int.needsSelection = true;
        }
        // if the interface has the inside checkbox checked (inside: true)
        if (int.inside) {
          oneInsidePrefix = true;
          int.needsSelection = false;
          interfaceMatrix.insidePrefix = int.interface;
        }
        // if the interface has the external checkbox checked (external: true)
        if (int.external) {
          int.needsSelection = false;
          interfaceMatrix.external.push(int.interface);

          // if the interface has the intervrf checkbox checked (external: true)
        } else if (int.intervrf) {
          int.needsSelection = false;
          interfaceMatrix.intervrf.push(int.interface);
        }
      });
      if (!oneInsidePrefix) {
        hostWithInterfaces.needsInsidePrefix = true;
      } else {
        hostWithInterfaces.needsInsidePrefix = false;
      }
      hostWithInterfaces.interfaceMatrix = interfaceMatrix;
    });

    // lock second form
    this.submittedSecondForm = true;
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

  public deviceConfigFileChange(event): void {
    this.initialForm.controls.deviceType.disable();
    const reader = new FileReader();
    const file = event.target.files[0];
    reader.readAsText(file);
    reader.onload = () => {
      const readableText = reader.result.toString();
      const deviceType = this.initialForm.controls.deviceType.value;
      if (deviceType === 'PA') {
        this.f.intervrfSubnets.setValidators(Validators.required);
        const parser = new DOMParser();
        const parsed = parser.parseFromString(readableText, 'text/xml');
        const json: any = this.xml2json(parsed);
        this.rawConfig = readableText;
        const vsysArrayFromConfig = json.config.devices.entry.vsys.entry;
        for (let i = 0; i < vsysArrayFromConfig.length; i++) {
          vsysArrayFromConfig[i].name = this.vsysHolderArray[i];
        }
        vsysArrayFromConfig.map(vsys => {
          vsys.zones = [];
          const numOfZones = vsys.zone.entry.length;
          const zonesToApply = this.zoneHolderArray.splice(0, numOfZones);
          zonesToApply.map(zone => {
            vsys.zones.push({ interface: zone });
          });
          this.hostsWithInterfaces.push({ hostname: vsys.name, interfaces: vsys.zones });
          this.tiersFromConfig.push(vsys.name);
        });

        // BLOCK CODE COMMENT
        // THIS WAS OLD CODE THAT WORKED BEFORE IMPLEMENTING A NEW SOLUTION
        // USING AN XML -> JSON FUNCTION
        // KEEP THIS AROUND IN CASE OF A NEED TO REVERT

        // vsysArrayFromConfig.map(vsys => {
        //   vsys.zones = [];
        //   const numOfZones = vsys.zone.entry.length;

        //   // close
        //   // need to pop off elements as they move from one array to another
        //   for (let i = 0; i < numOfZones; i++) {
        //     vsys.zones.push(this.zoneHolderArray[i]);
        //   }
        // });
        // const childNodes = parsed.childNodes[0];
        // const devices = childNodes.childNodes[5];
        // const entry = devices.childNodes[1];
        // const vsys = entry.childNodes[5];
        // const entries = vsys.childNodes;
        // const entryArray = [];
        // for (let i = 0; i < entries.length; i++) {
        //   if (i % 2 === 0) {
        //     continue;
        //   } else {
        //     entryArray.push(entries[i]);
        //   }
        // }
        // const securityZones = [];
        // const vsysValueArray = [];
        // entryArray.map(entry => {
        //   const zoneChildren = entry.childNodes[13].children;
        // for (let i = 0; i < zoneChildren.length; i++) {
        //   securityZones.push(zoneChildren[i].attributes[0].value)
        // }
        //   const vsysName = entry.attributes[0].value;
        //   vsysValueArray.push(vsysName);
        //   this.hostsWithInterfaces.push({ hostname: vsysName, interfaces: securityZones });
        // });
        // this.tiersFromConfig = vsysArrayFromConfig.map(vsys => {
        //   return `${vsys.name}`;
        // });
        // vsysArrayFromConfig.map(vsys => {
        //   this.hostsWithInterfaces.push({'hostname': vsys.name, 'interfaces': vsys.zones})
        // })
      }

      // use regex to search for hostname for ASA configs
      if (deviceType === 'ASA') {
        this.f.intervrfSubnets.clearValidators();
        this.rawConfig = readableText;
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
            this.tiersFromConfig.push(hostname);
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

        this.hostsWithInterfaces = this.interfaceMatrixHelper(hostnameIndexes, this.asaInterfacesWithIndex, splitFileByLine.length);
      }
    };
    this.f.deviceConfig.disable();
  }

  //psuedo :
  // take the value, find the index in the string
  // if there are multiple entries with the same value
  // pass the same args to the function this time providing an offset
  // the offset is the index found in the initial function run
  // the offset will also be the index each time a duplicate interface is encountered
  // this ensures we are always checking the NEXT instance of an interface match
  private recursivelyGetIndexes(val, file, offset?): void {
    // if we've already encountered an interface match, we use the offset
    // which is the index of that interface match to give us our starting point
    if (offset) {
      const index = file.indexOf(' ' + val + '\r', offset + 1);
      if (index !== -1) {
        this.asaInterfacesWithIndex.push({ interface: val, index: index });
        this.recursivelyGetIndexes(val, file, index);
      } else {
        return;
      }
    } else {
      const index = file.indexOf(' ' + val + '\r');
      if (index !== -1) {
        this.asaInterfacesWithIndex.push({ interface: val, index: index });
        this.recursivelyGetIndexes(val, file, index);
      } else {
        return;
      }
    }
  }

  // helper function for building the interface matrix

  // after this function executes we will have a range associated with each hostname
  // this range tells us that any interfaces that fall within this range should belong to that hostname
  private interfaceMatrixHelper(hostnamesWithIndex, interfacesWithIndex, eof) {
    for (let i = 0; i < hostnamesWithIndex.length; i++) {
      // get range for each hostname
      const range = { min: '', max: '' };

      // the min range is the index of the starting hostname
      range.min = hostnamesWithIndex[i].hostnameIndex;

      if (hostnamesWithIndex[i + 1]) {
        // the max range is the index of the NEXT hostname
        range.max = hostnamesWithIndex[i + 1].hostnameIndex;
      } else {
        // if there is no next hostname, the max range is end of file
        range.max = eof;
      }
      hostnamesWithIndex[i].range = range;
    }

    // map through each hostname now that we have ranges for each one
    hostnamesWithIndex.map(host => {
      host.interfaces = [];

      // map through all interfaces (with their index)
      interfacesWithIndex.map(int => {
        // if the index of the interface falls between the host's range
        // we add that interface to the list of host.interfaces
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
    this.submittedFirstForm = false;
    this.submittedSecondForm = false;
    this.asaInterfacesWithIndex = [];
    this.hostsWithInterfaces = [];
    this.tiersFromConfig = [];
    this.initialForm.reset();
    this.initialForm.enable();
    if (this.continuedForm) {
      this.continuedForm.reset();
      this.continuedForm.enable();
    }

    console.log('this.form', this.initialForm);
  }

  public save() {
    this.submittedSecondForm = true;
    const mappedObjects = this.cf.selectedTiers.value;
    if (this.continuedForm.invalid) {
      return;
    }
    const filteredMappedObjects = mappedObjects.map(obj => {
      return { hostname: obj.hostname, interfaceMatrix: obj.interfaceMatrix, namespace: obj.namespace ? obj.namespace : null };
    });
    const configDto = { mappedObjects: filteredMappedObjects, rawConfig: '' };
    configDto.rawConfig = this.rawConfig;
    console.log('configDto', configDto);
    this.createSelfService(configDto);
  }

  private createSelfService(configDto) {
    if (this.f.deviceType.value === 'ASA') {
      this.selfServiceService.processAsaConfigSelfService({ selfServiceConfig: configDto }).subscribe(data => {
        console.log('data', data);
      });
    } else if (this.f.deviceType.value === 'PA') {
      this.selfServiceService.processPAConfigSelfService({ selfServiceConfig: configDto }).subscribe(data => {
        console.log('data', data);
      });
    }
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

  ngOnDestroy(): void {
    this.reset();
  }
}
