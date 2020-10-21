import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActifioProfileDto, V1AgmProfilesService } from 'api_client';

interface ProfileView extends ActifioProfileDto {
  mostRecentChangeDate: string;
}

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
      {
        name: 'Description',
        property: 'description',
      },
      {
        name: 'Local Cluster',
        property: 'localClusterName',
      },
      {
        name: 'Remote Cluster',
        property: 'remoteClusterName',
      },
      {
        name: 'Last Modified',
        property: 'mostRecentChangeDate',
      },
    ],
  };
  public isLoading = false;
  public profiles: ProfileView[] = [];

  constructor(private agmProfileService: V1AgmProfilesService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  public loadProfiles(): void {
    this.isLoading = true;
    this.agmProfileService.v1AgmProfilesGet({ limit: 100, offset: 0 }).subscribe(profiles => {
      this.profiles = profiles.map(profile => {
        return {
          ...profile,
          description: profile.description || '--',
          remoteClusterName: profile.remoteClusterName || '--',
          mostRecentChangeDate: this.getMostRecentChange(profile.lastModifiedDate, profile.createdDate),
        };
      });
      this.isLoading = false;
    });
  }

  private getMostRecentChange(modifiedDate: string, createdDate: string): string {
    const transformDate = date => (date ? this.datePipe.transform(date, 'M/d/yy, h:mm:ss a') : '--');
    if (!modifiedDate) {
      return transformDate(createdDate);
    }
    return transformDate(modifiedDate);
  }
}
