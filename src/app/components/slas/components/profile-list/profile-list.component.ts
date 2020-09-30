import { Component, OnInit } from '@angular/core';
import { ActifioProfileDto, V1AgmProfilesService } from 'api_client';

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
})
export class ProfileListComponent implements OnInit {
  public config = {
    description: 'List of SLA Profiles',
    columns: [
      {
        name: 'Name',
        property: 'name',
      },
    ],
  };
  public isLoading = false;
  public profiles: ActifioProfileDto[] = [];

  constructor(private agmProfileService: V1AgmProfilesService) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  public loadProfiles(): void {
    this.isLoading = true;
    this.agmProfileService.v1AgmProfilesGet({}).subscribe(data => {
      this.profiles = data;
      this.isLoading = false;
    });
  }
}
