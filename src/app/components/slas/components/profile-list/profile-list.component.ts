import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

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
  public profiles: ProfileDto[] = [];

  // private agmProfileService: V1AGMProfilesService,
  constructor() {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  public loadProfiles(): void {
    of([
      {
        id: '1',
        name: 'Profile #1',
      },
    ]).subscribe(data => {
      this.profiles = data;
    });
  }
}

interface ProfileDto {
  id: string;
  name: string;
}
