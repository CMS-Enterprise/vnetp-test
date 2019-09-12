import { Component, OnInit } from '@angular/core';
import { SolarisImage } from 'src/app/models/solaris/solaris-image';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AuthService } from 'src/app/services/auth.service';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { SolarisService } from '../solaris-services/solaris-service.service';
import { HelpersService } from 'src/app/services/helpers.service';
import { HelpTextSolaris } from 'src/app/services/help-text-solaris';
@Component({
  selector: 'app-solaris-image-repository',
  templateUrl: './solaris-image-repository.component.html'
})
export class SolarisImageRepositoryComponent implements OnInit {
  SolarisImages: Array<SolarisImage>;
  SolarisImageParentDeviceID: number;
  SolarisImageDeviceName: string;

  newSolarisImage: SolarisImage;
  toDeleteSolarisImageName: string;

  // Used for edit Solaris Image
  editCurrentImage: boolean;
  editImageIndex: number;
  currentImage: SolarisImage;

  constructor(
    private ngxSm: NgxSmartModalService,
    private authService: AuthService,
    private automationApiService: AutomationApiService,
    private solarisService: SolarisService,
    private hs: HelpersService,
    public helpText: HelpTextSolaris
  ) {
    this.SolarisImages = new Array<SolarisImage>();
  }

  ngOnInit() {
    // Enumerate previously created Images tied to customer
    this.automationApiService
      .getSolarisImages(this.solarisService.SolarisImageDeviceName)
      .subscribe(data => {
        const response: { [k: string]: any } = {};
        response.data = data;
        response.data.parts.forEach(element => {
          const imgResponse = this.hs.getJsonCustomField(
            element,
            'Metadata'
          ) as SolarisImage;
          if (imgResponse !== null) {
            imgResponse.Id = element.part_id;
            this.SolarisImages.push(imgResponse);
          }
        });
      });
    this.newSolarisImage = new SolarisImage();
  }

  openImageModal() {
    if (this.editCurrentImage) {
      this.newSolarisImage = this.currentImage;
      this.currentImage = new SolarisImage();
    }
    this.ngxSm.getModal('imageModal').open();
  }

  insertImage() {
    // Set parent device property to image name stored in solarisService
    this.newSolarisImage.ParentDevice = this.solarisService.SolarisImageDeviceName;
    if (this.editCurrentImage) {
      this.SolarisImages[this.editImageIndex] = this.hs.deepCopy(
        this.newSolarisImage
      );
      // Reset edit flag and index
      this.editCurrentImage = false;
      this.editImageIndex = null;
    } else {
      this.SolarisImages.push(Object.assign({}, this.newSolarisImage));
    }
    this.ngxSm.getModal('imageModal').close();
    this.newSolarisImage = new SolarisImage();
  }
  editImage(image) {
    this.editCurrentImage = true;
    this.editImageIndex = this.SolarisImages.indexOf(image);
    this.currentImage = this.hs.deepCopy(image);
    this.openImageModal();
  }
  deleteImage(image: SolarisImage) {
    const extra_vars: { [k: string]: any } = {};
    extra_vars.id = image.Id;
    const body = { extra_vars };
    this.automationApiService
      .launchTemplate(`delete-solaris-image`, body, true)
      .subscribe();

    const index = this.SolarisImages.indexOf(image);

    if (index > -1) {
      this.SolarisImages.splice(index, 1);
    }
  }
  launchSolarisImageJobs() {
    //create extra_vars to pass into Ansible
    const extra_vars: { [k: string]: any } = {};
    this.newSolarisImage.Size = 0;
    this.newSolarisImage.ParentDevice = this.solarisService.SolarisImageDeviceName;
    extra_vars.SolarisImages = this.newSolarisImage;
    const body = { extra_vars };
    this.ngxSm.getModal('imageModal').close();

    // Launch playbook
    this.automationApiService
      .launchTemplate('save-solaris-image', body, true)
      .subscribe();
    this.newSolarisImage = new SolarisImage();
  }
}
