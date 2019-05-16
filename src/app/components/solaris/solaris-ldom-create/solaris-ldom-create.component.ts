import { Component, OnInit } from '@angular/core';
import { SolarisServiceService } from '../solaris-services/solaris-service.service';
import { SolarisLdom } from 'src/app/models/solaris-ldom';


@Component({
  selector: 'app-solaris-ldom-create',
  templateUrl: './solaris-ldom-create.component.html',
   styleUrls: ['./solaris-ldom-create.component.css']
})
export class SolarisLdomCreateComponent implements OnInit {
  LDOM: SolarisLdom
  ldomFilter: string[];
  vnets: Array<any>;
  vdisks: string[];
  inputLDOMvnet: string;
  constructor(private solarisService: SolarisServiceService) { 
    this.vnets = new Array<any>();
    this.LDOM = new SolarisLdom();
  }
  addvnets(){
    /*
    var vnetUL = document.getElementById("vnetUL");

    var li = document.createElement("li");
    li.setAttribute('id', vnetInput.nodeValue);
    li.appendChild(document.createTextNode(vnetName));
    vnetUL.appendChild(li);
    */
   // var vnetInputtest = (<HTMLInputElement>document.getElementById("inputLDOMvnet")).value;
   this.LDOM.add_vnet.push(this.inputLDOMvnet);
   //Create commands that will be sent as add-vnet parameter 
   const vnetIndex = this.LDOM.add_vnet.length - 1
   const vnetCmdString = `id=${vnetIndex} vnet${vnetIndex} ${this.inputLDOMvnet}`
   this.LDOM.add_vnet_cmd.push(vnetCmdString);
   this.inputLDOMvnet = '';
   console.log(this.vnets);
  }
  moveObjectPosition(value: number, obj, objArray){
    //determine the current index in the array
    const objIndex = objArray.indexOf(obj);
    // If the object isn't in the array, is at the start of the array and requested to move up
    // or if the object is at the end of the array, return.
    if (objIndex === -1 || objIndex === 0 && value === -1 || objIndex + value === objArray.length) { return; }
    const nextObj = objArray[objIndex + value];
    //If next object doesn't exist, return
    if (nextObj == null ) { return ;}
    const nextObjIndex = objArray.indexOf(nextObj);
    [objArray[objIndex], objArray[nextObjIndex]] =
    [objArray[nextObjIndex], objArray[objIndex]]

  }
  getLdoms() {

    if (this.ldomFilter) {
    // this.apiService.getLdoms(this.ldomFilter);
    } else if (!this.ldomFilter) {
      // this.apiService.getLdoms();
    }
  }

  ngOnInit() {
    this.ldomFilter = Object.assign([], this.solarisService.ldomFilter as string[]);
    this.getLdoms();
  }
}
