import { Component, OnInit } from '@angular/core';
import { SolarisImage } from 'src/app/models/solaris/solaris-image';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AuthService } from 'src/app/services/auth.service';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SolarisService } from '../solaris-services/solaris-service.service';
@Component({
  selector: 'app-solaris-image-repository',
  templateUrl: './solaris-image-repository.component.html',
  styleUrls: ['./solaris-image-repository.component.css']
})
export class SolarisImageRepositoryComponent implements OnInit {


  SolarisImages: Array<SolarisImage>;
  SolarisImageParentDeviceID: number;
  SolarisImageDeviceName: string;

  newSolarisImage: SolarisImage;

  constructor(
    private ngxSm: NgxSmartModalService,
    private authService: AuthService,
    private automationApiService: AutomationApiService,
    private solarisService: SolarisService
    ) { }

  ngOnInit() {
    // populate ID of Solaris Image report

    this.automationApiService.getDevicesbyName(this.solarisService.SolarisImageDeviceName).subscribe(data => {
      // const SolarisImageDeviceName = `__${this.authService.currentUserValue.CustomerName}_solaris_images__`;
      const response: { [k: string]: any } = {};
      response.data = data;
      const SolarisImageParentDevice = response.data.Devices.filter(device => 
        device.name === this.solarisService.SolarisImageDeviceName
        )[0];
      this.SolarisImageParentDeviceID = SolarisImageParentDevice.device_id;
      console.log(this.SolarisImageParentDeviceID);
    });
    this.SolarisImages = new Array<SolarisImage>();
    this.SolarisImages.push({Name: 'Solaris Image 1', Size: 4200, Version: '11', Protocol: 'HTTPS', Source: '', ParentDevice: this.solarisService.SolarisImageDeviceName},
    {Name: 'Solaris Image 2', Size: 3700, Version: '10', Protocol: 'NFS', Source: '',ParentDevice: this.solarisService.SolarisImageDeviceName});

    this.newSolarisImage = new SolarisImage();
  }

  openImageModal() {
    this.ngxSm.getModal('imageModal').open();
  }

  insertImage() {
    this.newSolarisImage.Size = Math.floor(Math.random() * 5000) + 1;
    this.newSolarisImage.ParentDevice = this.solarisService.SolarisImageDeviceName;
    this.SolarisImages.push(Object.assign({}, this.newSolarisImage));
    this.ngxSm.getModal('imageModal').close();
    this.newSolarisImage = new SolarisImage();
  }

  deleteImage(image) {
    const index = this.SolarisImages.indexOf(image);

    if (index > -1) {
      this.SolarisImages.splice(index, 1);
    }
  }
  launchSolarisImageJobs(){
    //create extra_vars to pass into Ansible
    const extra_vars: { [k: string]: any } = {};
    extra_vars.SolarisImages = this.SolarisImages;
    const body = { extra_vars };
    
    // Launch playbook
    this.automationApiService.launchTemplate('save-solaris-image', body, true).subscribe();
  }

}
