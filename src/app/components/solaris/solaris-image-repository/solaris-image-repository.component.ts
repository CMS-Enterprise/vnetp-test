import { Component, OnInit } from '@angular/core';
import { SolarisImage } from 'src/app/models/solaris/solaris-image';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-solaris-image-repository',
  templateUrl: './solaris-image-repository.component.html',
  styleUrls: ['./solaris-image-repository.component.css']
})
export class SolarisImageRepositoryComponent implements OnInit {


  SolarisImages: Array<SolarisImage>;


  newSolarisImage: SolarisImage;

  constructor(private ngxSm: NgxSmartModalService) { }

  ngOnInit() {
    this.SolarisImages = new Array<SolarisImage>();
    this.SolarisImages.push({Name: 'Solaris Image 1', Size: 4200, Version: '11', Protocol: 'HTTPS', Source: ''},
    {Name: 'Solaris Image 2', Size: 3700, Version: '10', Protocol: 'NFS', Source: ''});

    this.newSolarisImage = new SolarisImage();
  }

  openImageModal() {
    this.ngxSm.getModal('imageModal').open();
  }

  insertImage() {
    this.newSolarisImage.Size = Math.floor(Math.random() * 5000) + 1;
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

}
