import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tier, V1DatacentersService, V1SelfServiceService, V1TiersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { SelfServiceModalHostWithInterfaces } from './self-service-modal-dtos/self-service-modal-host-with-interfaces-dto';
import { SelfServiceModalAsaInterfaceWithIndex } from './self-service-modal-dtos/self-service-modal-asa-interface-with-index-dto';
import ObjectUtil from 'src/app/utils/ObjectUtil';

@Component({
  selector: 'app-self-service-modal',
  styleUrls: ['./self-service-modal.component.scss'],
  templateUrl: './self-service-modal.component.html',
})
export class SelfServiceModalComponent implements OnInit, OnDestroy {
  initialForm: FormGroup;
  submittedInitialForm: boolean;
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
  rawConfigFileName;
  invalidInterface: boolean;
  selectedTiers = [];
  receivedConfig: boolean;
  showSpinner: boolean;
  selfService: any;
  firewallRuleGroupData = {} as any;
  natRuleGroupData = {} as any;
  showFooter = true;

  private currentDatacenterSubscription: Subscription;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private datacenterContextService: DatacenterContextService,
    private selfServiceService: V1SelfServiceService,
    private tiersService: V1TiersService,
  ) {}

  get f() {
    return this.initialForm.controls;
  }

  // converts XML data to JSON format
  xml2json(xml) {
    try {
      let obj = {};
      if (xml.children.length > 0) {
        for (let i = 0; i < xml.children.length; i++) {
          const item = xml.children.item(i);
          const nodeName = item.nodeName;

          // custom logic to get the list of vsys's from the XML data
          if (xml.nodeName === 'vsys') {
            const vsysName = item.attributes[0].value;
            this.vsysHolderArray.push(vsysName);
          }
          // custom logic to get the list of security zones from the XML data
          if (xml.nodeName === 'zone') {
            const zoneName = item.attributes[0].value;
            this.zoneHolderArray.push(zoneName);
          }

          if (typeof obj[nodeName] === 'undefined') {
            obj[nodeName] = this.xml2json(item);
          } else {
            if (typeof obj[nodeName].push === 'undefined') {
              const old = obj[nodeName];

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
      intervrfSubnets: [null],
      selectedTiersFromConfig: ['', Validators.required],
    });
  }

  // submits first form/locks the users selectedTiersFromConfig selections
  public saveTiers(): void {
    this.submittedInitialForm = true;
    if (this.initialForm.invalid) {
      this.showSecondForm = false;
      return;
    }
    this.showSecondForm = true;
    const selectedTiers = this.f.selectedTiersFromConfig.value;
    if (this.f.deviceType.value === 'ASA') {
      this.hostsWithInterfaces.map(host => {
        host.interfaces.map(int => {
          // strip `nameof` from ASA interfaces
          int.interface = int.interface.split(' ')[1];
          return int;
        });
      });
    }
    // find union between selectedTiers and mappedHostnamesWithInterfaces
    // if a tier from the config was not choosen by the user
    // filter it out from mapping that tier and moving on the interfaces form
    this.hostsWithInterfaces = this.hostsWithInterfaces.filter(host => {
      if (selectedTiers.includes(host.hostname)) {
        return host;
      }
    });
    // disable first form
    this.initialForm.controls.selectedTiersFromConfig.disable();

    // create second form using the value from the union we created above
    this.selectedTiers = this.hostsWithInterfaces;
  }

  // submits second form/locks the users interface selections
  public saveNameSpaces(): void {
    let needsNamespace = false;
    // if there is more than 1 host to import, we enforce the namespace property
    if (this.selectedTiers.length > 1) {
      needsNamespace = true;
    }

    // map through all selectedTiers
    this.selectedTiers.map(hostWithInterfaces => {
      if (!hostWithInterfaces.insidePrefix) {
        hostWithInterfaces.needsInsidePrefix = true;
      } else {
        hostWithInterfaces.needsInsidePrefix = false;
      }

      // if the selected host's insidePrefix value is too long, flip flag
      if (hostWithInterfaces.insidePrefix && hostWithInterfaces.insidePrefix.length > 50) {
        hostWithInterfaces.insidePrefixTooLong = true;
      } else {
        hostWithInterfaces.insidePrefixTooLong = false;
      }
      // each host will have an interfaceMatrix
      const interfaceMatrix = { external: [], intervrf: [], insidePrefix: '' };

      // regex validation of the insidePrefix textbox
      const textboxRgex = /^[A-Za-z0-9_-]*$/;
      const insidePrefixResult = textboxRgex.test(hostWithInterfaces.insidePrefix);
      if (!insidePrefixResult) {
        hostWithInterfaces.insidePrefixAlphanumericalFail = true;
      } else {
        interfaceMatrix.insidePrefix = hostWithInterfaces.insidePrefix;
        hostWithInterfaces.insidePrefixAlphanumericalFail = false;
      }

      // regex validation of the namespace textbox
      if (hostWithInterfaces.namespace) {
        const namespaceResult = textboxRgex.test(hostWithInterfaces.namespace);
        if (!namespaceResult) {
          hostWithInterfaces.namespaceAlphanumericalFail = true;
        } else {
          hostWithInterfaces.namespaceAlphanumericalFail = false;
        }
      } else {
        hostWithInterfaces.namespaceAlphanumericalFail = false;
      }

      // we build the interfaceMatrix based on the users check box values in the continued form
      hostWithInterfaces.interfaces.map(int => {
        if (!int.intervrf && !int.outside) {
          int.needsSelection = true;
        }
        // if the interface has the external checkbox checked (external: true)
        if (int.external) {
          int.needsSelection = false;
          interfaceMatrix.external.push(int.interface);

          // if the interface has the intervrf checkbox checked (intervrf: true)
        } else if (int.intervrf) {
          int.needsSelection = false;
          interfaceMatrix.intervrf.push(int.interface);
        }
        if (int.needsSelection) {
          this.invalidInterface = true;
        } else {
          this.invalidInterface = false;
        }
      });

      hostWithInterfaces.interfaceMatrix = interfaceMatrix;

      // if there are multiple selectedTiers, we enforce the namespace property on each selectedTier
      if (needsNamespace) {
        if (hostWithInterfaces.namespace) {
          hostWithInterfaces.needsNamespace = false;
        } else {
          hostWithInterfaces.needsNamespace = true;
        }
      } else {
        hostWithInterfaces.needsNamespace = false;
      }
    });

    // this for loop performs a check that loops through each selected tier
    // if the namespace for a selected tier matches another host, we fail the form submission
    // and tell the user to change one of the namespaces

    // tslint:disable-next-line
    for (let i = 0; i < this.selectedTiers.length; i++) {
      const tier = this.selectedTiers[i];
      this.selectedTiers.map(selectedTier => {
        if (tier !== selectedTier) {
          if (tier.namespace === selectedTier.namespace) {
            selectedTier.sameNamespace = true;
          } else {
            selectedTier.sameNamespace = false;
          }
        }
        selectedTier.sameNamespace = false;
        if (tier.namespace && tier.namespace.length > 11) {
          tier.namespaceTooLong = true;
        } else {
          tier.namespaceTooLong = false;
        }
      });
    }
    // if any host is missing an insidePrefix, fails the regex validation test for either insidePrefix or namespace,
    // contains an insidePrefix that is too many characters,
    // does not contain a namespace when it should, contains the same namespace as another host,
    // contains a namespace that is too many characters,
    // that host/interface is marked as invalid
    this.selectedTiers.map(host => {
      if (
        host.needsInsidePrefix ||
        host.insidePrefixAlphanumericalFail ||
        host.namespaceAlphanumericalFail ||
        host.insidePrefixTooLong ||
        host.needsNamespace ||
        host.sameNamespace ||
        host.namespaceTooLong
      ) {
        this.invalidInterface = true;
      }
    });

    // lock second form
    this.submittedSecondForm = true;

    if (!this.invalidInterface) {
      this.showSpinner = true;
      this.save();
    } else {
      console.log('somethingisInvalid');
    }
  }

  public markInterfaceIntervrf(int): void {
    int.intervrf = true;
    int.external = false;
  }

  public markInterfaceExternal(int): void {
    int.external = true;
    int.intervrf = false;
  }

  public deviceConfigFileChange(event): void {
    // do not allow user to change the device type once a device config has been uploaded
    this.initialForm.controls.deviceType.disable();
    const reader = new FileReader();
    const file = event.target.files[0];
    const deviceType = this.initialForm.controls.deviceType.value;

    // do file type checking
    // for PA devices the file type must be text/xml
    // if not we set an error on that form field
    if (deviceType === 'PA') {
      if (file.type !== 'text/xml') {
        this.f.deviceConfig.setErrors({ incorrectFileType: true });
        return;
      } else {
        this.f.deviceConfig.setErrors(null);
      }
    }
    // for ASA devices the file type must be '' (.log does not register)
    // if not we set an error on that form field
    if (deviceType === 'ASA') {
      if (file.type !== '') {
        this.f.deviceConfig.setErrors({ incorrectFileType: true });
        return;
      } else {
        this.f.deviceConfig.setErrors(null);
      }
    }
    reader.readAsText(file);
    reader.onload = () => {
      // convert file reader result to human readable text
      const readableText = reader.result.toString();
      if (deviceType === 'PA') {
        // if device type is PA, set a new required validator on the intervrfSubnets form field
        this.f.intervrfSubnets.setValidators(Validators.required);
        this.f.intervrfSubnets.updateValueAndValidity();
        // instantiate parser to read XML data
        const parser = new DOMParser();
        const parsed = parser.parseFromString(readableText, 'text/xml');
        // convert XML parsed data to json format for object readability
        const json: any = this.xml2json(parsed);
        this.rawConfigFileName = this.initialForm.controls.deviceConfig.value;
        this.rawConfigFileName = this.rawConfigFileName.split('\\');
        const arrayLength = this.rawConfigFileName.length;
        this.rawConfigFileName = this.rawConfigFileName[arrayLength - 1];
        this.rawConfig = readableText;
        // the vsys array is located here in the json object body
        let vsysArrayFromConfig = json.config.devices.entry.vsys.entry;
        // add name property to vsys array from config
        if (!Array.isArray(vsysArrayFromConfig)) {
          vsysArrayFromConfig = [vsysArrayFromConfig];
        }
        for (let i = 0; i < vsysArrayFromConfig.length; i++) {
          vsysArrayFromConfig[i].name = this.vsysHolderArray[i];
        }
        // map through the vsys array from the config
        vsysArrayFromConfig.map(vsys => {
          vsys.zones = [];
          // get the number of security zones in each vsys
          const numOfZones = vsys.zone.entry.length;
          // use the numOfZones to break up the current zoneHolderArray by each vsys
          const zonesToApply = this.zoneHolderArray.splice(0, numOfZones);
          // add the zones to the vsys.zones array
          zonesToApply.map(zone => {
            vsys.zones.push({ interface: zone });
          });
          // append newly mapped object to component hostsWithInterfaces object
          this.hostsWithInterfaces.push({ hostname: vsys.name, interfaces: vsys.zones });
          // add the vsys name to the list of tiers that were extracted from the device config
          this.tiersFromConfig.push(vsys.name);
        });
      }

      // use regex to search for hostname for ASA configs
      if (deviceType === 'ASA') {
        // since deviceType is not PA, we do not need a required validator on the intervrfSubnets form field
        this.f.intervrfSubnets.clearValidators();
        this.f.intervrfSubnets.updateValueAndValidity();
        this.rawConfigFileName = this.initialForm.controls.deviceConfig.value;
        this.rawConfigFileName = this.rawConfigFileName.split('\\');
        const arrayLength = this.rawConfigFileName.length;
        this.rawConfigFileName = this.rawConfigFileName[arrayLength - 1];
        this.rawConfig = readableText;
        // split readableText into an array of lines, each member in the array is an individual line in the device config
        const splitFileByLine = readableText.split('\n');
        const hostnameRegex = /hostname(.*)/g;
        const nameifRegex = /nameif(.*)/g;
        // use regex to find the hostnames in the device config
        const hostnames = readableText.match(hostnameRegex);
        // use regex to find the interfaces in the device config
        const interfaces = readableText.match(nameifRegex);
        const hostnameIndexes = [];
        // map through each hostname
        hostnames.map(hostname => {
          // get the index (line number) of each hostname
          const hostnameIndex = splitFileByLine.indexOf(hostname + '\r');
          if (hostnameIndex !== -1) {
            // strip whitespace from hostname
            hostname = hostname.split(' ')[1];
            // add newly mapped hostname to hostnameIndexes array
            // tslint:disable-next-line
            hostnameIndexes.push({ hostname: hostname, hostnameIndex: hostnameIndex });
            // add the hostname to the list of tiers extracted from the device config
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
        // after getting the index for each interface, pass the hostnameIndexes, asaInterfaceIndexes,
        // and the length of the file (number of lines) to helper func
        this.hostsWithInterfaces = this.interfaceMatrixHelper(hostnameIndexes, this.asaInterfacesWithIndex, splitFileByLine.length);
      }
    };
    this.f.deviceConfig.disable();
  }

  // psuedo :
  // take the value, find the index (line number) in the string (text file)
  // if there are multiple entries with the same value
  // pass the same args to the function this time providing an offset
  // the offset is the index found in the initial function run
  // the offset will also be the index each time a duplicate interface is encountered
  // this ensures we are always checking the NEXT instance of an interface match
  private recursivelyGetIndexes(val, file, offset?): void {
    // if we've already encountered an interface match, we use the offset
    // which is the index of that interface match to give us our starting point
    if (offset) {
      // tslint:disable-next-line
      const index = file.indexOf(' ' + val + '\r', offset + 1);
      if (index !== -1) {
        // tslint:disable-next-line
        this.asaInterfacesWithIndex.push({ interface: val, index: index });
        this.recursivelyGetIndexes(val, file, index);
      } else {
        return;
      }
    } else {
      // tslint:disable-next-line
      const index = file.indexOf(' ' + val + '\r');
      if (index !== -1) {
        // tslint:disable-next-line
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
      // assign range property to hostname
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

  public intervrfSubnetsFileChange(event): void {
    const reader = new FileReader();
    const file = event.target.files[0];
    reader.readAsText(file);
    reader.onload = () => {
      const readableText = reader.result.toString();
      const splitFileByLine = readableText.split('\n');
      this.f.intervrfSubnets.setValue(readableText);
    };
  }

  public reset(): void {
    this.submittedInitialForm = false;
    this.submittedSecondForm = false;
    this.asaInterfacesWithIndex = [];
    this.hostsWithInterfaces = [];
    this.tiersFromConfig = [];
    this.selectedTiers = [];
    this.receivedConfig = false;
    this.showSpinner = false;
    this.showSecondForm = false;
    this.initialForm.reset();
    this.initialForm.enable();
  }

  public getTiers(): void {
    this.tiersService
      .getManyDatacenterTier({
        limit: 1000,
        datacenterId: this.datacenterId,
        join: ['firewallRuleGroups', 'natRuleGroups'],
      })
      .subscribe(returnedData => {
        this.tiers = returnedData as any;
      });
  }

  private getNatRuleGroupInfo(tierName) {
    const matchingTier = this.tiers.find(tier => tier.name === tierName);
    // matchingTier.firewallRuleGroups.filter(fwRuleGroup => fwRuleGroup.name !== 'Intravrf')
    this.natRuleGroupData = matchingTier.natRuleGroups.map(natRuleGroup => {
      if (natRuleGroup.name === 'Intravrf') {
        return;
      }
      return {
        tierName: matchingTier.name,
        tierUUId: matchingTier.id,
        name: natRuleGroup.name,
        natRuleGroupUUID: natRuleGroup.id,
        type: natRuleGroup.type,
      };
    });
    this.natRuleGroupData = this.natRuleGroupData.filter(natRuleGroup => {
      return natRuleGroup !== undefined;
    });
    return this.natRuleGroupData;
  }

  private getFwRuleGroupInfo(tierName) {
    const matchingTier = this.tiers.find(tier => tier.name === tierName);
    // matchingTier.firewallRuleGroups.filter(fwRuleGroup => fwRuleGroup.name !== 'Intravrf')
    this.firewallRuleGroupData = matchingTier.firewallRuleGroups.map(fwRuleGroup => {
      if (fwRuleGroup.name === 'Intravrf') {
        return;
      }
      return {
        tierName: matchingTier.name,
        tierUUId: matchingTier.id,
        name: fwRuleGroup.name,
        fwRuleGroupUUID: fwRuleGroup.id,
        type: fwRuleGroup.type,
      };
    });
    this.firewallRuleGroupData = this.firewallRuleGroupData.filter(fwRuleGroup => {
      return fwRuleGroup !== undefined;
    });
    return this.firewallRuleGroupData;
  }

  public save(): void {
    // `this.selectedTiers` holds all of the mapped objects that we want to use in the conversion script
    const mappedObjects = this.selectedTiers;
    // make object types the same regardless of device type for reusability
    const filteredMappedObjects = mappedObjects.map(obj => {
      return { hostname: obj.hostname, interfaceMatrix: obj.interfaceMatrix, namespace: obj.namespace ? obj.namespace : null };
    });
    // create configDto
    const configDto = {
      datacenterId: '',
      natRuleGroupInfo: {},
      fwRuleGroupInfo: {},
      dcsTier: '',
      dcsTierUUID: '',
      mappedObjects: filteredMappedObjects,
      rawTextConfig: '',
      rawXMLConfig: '',
      intervrfSubnets: null,
      rawConfigFileName: '',
    };
    if (this.f.deviceType.value === 'ASA') {
      configDto.rawTextConfig = this.rawConfig;
    }
    if (this.f.deviceType.value === 'PA') {
      configDto.rawXMLConfig = this.rawConfig;
    }
    configDto.dcsTier = this.f.DCSTierSelect.value;
    configDto.dcsTierUUID = this.getTierId(configDto.dcsTier);
    configDto.fwRuleGroupInfo = this.getFwRuleGroupInfo(configDto.dcsTier);
    configDto.natRuleGroupInfo = this.getNatRuleGroupInfo(configDto.dcsTier);
    configDto.datacenterId = this.datacenterId;
    configDto.rawConfigFileName = this.rawConfigFileName;
    this.createSelfService(configDto);
  }

  public getTierId = (name: string) => ObjectUtil.getObjectId(name, this.tiers);

  public onClose(): void {
    this.showFooter = true;
    this.ngx.resetModalData('selfServiceModal');
    this.ngx.getModal('selfServiceModal').close();
    this.reset();
  }

  private createSelfService(configDto): void {
    this.showFooter = false;
    if (this.f.deviceType.value === 'ASA') {
      this.selfServiceService.processAsaConfigSelfService({ selfService: configDto }).subscribe(
        returnedSelfServiceEntity => {
          this.showSpinner = false;
          this.receivedConfig = true;
          this.onClose();
        },
        () => {},
      );
    } else if (this.f.deviceType.value === 'PA') {
      configDto.intervrfSubnets = this.f.intervrfSubnets.value;
      this.selfServiceService.processPAConfigSelfService({ selfService: configDto }).subscribe(
        returnedSelfServiceEntity => {
          this.showSpinner = false;
          this.receivedConfig = true;
          this.onClose();
        },
        () => {},
      );
    }
  }

  ngOnInit(): void {
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
