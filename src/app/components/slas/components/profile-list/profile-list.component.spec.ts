import { MockComponent, MockFontAwesomeComponent } from 'src/test/mock-components';
import { ActifioProfileDto, V1ActifioGmProfilesService } from 'api_client';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ProfileListComponent } from './profile-list.component';
import { DatePipe } from '@angular/common';
import { MockProvider } from 'src/test/mock-providers';

describe('ProfileListComponent', () => {
  let component: ProfileListComponent;
  let fixture: ComponentFixture<ProfileListComponent>;

  const dates = {
    created: 'Tue, 08 Sep 2020 00:00:00 GMT',
    modified: 'Thu, 08 Oct 2020 00:00:00 GMT',
  };

  const createProfiles = (): ActifioProfileDto[] => {
    const setProp = (prop: string, index: number) => `${prop}-${index + 1}`;
    return Array(400)
      .fill(null)
      .map((val: null, index: number) => {
        return {
          id: setProp('id', index),
          name: setProp('name', index),
          description: setProp('description', index),
          remoteClusterName: setProp('remoteClusterName', index),
          localClusterName: setProp('localClusterName', index),
          lastModifiedDate: dates.modified,
          createdDate: dates.created,
          sourceClusterId: setProp('sourceClusterId', index),
        };
      });
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [MockComponent({ selector: 'app-table', inputs: ['data', 'config'] }), MockFontAwesomeComponent, ProfileListComponent],
      providers: [MockProvider(V1ActifioGmProfilesService), { useValue: { transform: date => date }, provide: DatePipe }],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ProfileListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call to get profiles on init', () => {
    const profileService = TestBed.inject(V1ActifioGmProfilesService);
    const spy = jest.spyOn(profileService, 'v1ActifioGmProfilesGet');

    component.ngOnInit();

    expect(spy).toHaveBeenCalledWith({});
  });

  it('should default an empty description to be "--"', () => {
    const profileService = TestBed.inject(V1ActifioGmProfilesService) as any;
    jest.spyOn(profileService, 'v1ActifioGmProfilesGet').mockImplementation(() => {
      const profiles = createProfiles();
      profiles[0].description = undefined;
      return of(profiles);
    });
    component.ngOnInit();

    const [profile1] = component.profiles;
    expect(profile1.description).toBe('--');
  });

  it('should default an empty remote cluster name to be "--"', () => {
    const profileService = TestBed.inject(V1ActifioGmProfilesService) as any;
    jest.spyOn(profileService, 'v1ActifioGmProfilesGet').mockImplementation(() => {
      const profiles = createProfiles();
      profiles[0].remoteClusterName = undefined;
      return of(profiles);
    });
    component.ngOnInit();

    const [profile1] = component.profiles;
    expect(profile1.remoteClusterName).toBe('--');
  });

  it('should set the most recent change date to the created date when modified date is not defined', () => {
    const profileService = TestBed.inject(V1ActifioGmProfilesService) as any;
    jest.spyOn(profileService, 'v1ActifioGmProfilesGet').mockImplementation(() => {
      const profiles = createProfiles();
      profiles[0].lastModifiedDate = undefined;
      return of(profiles);
    });
    component.ngOnInit();

    const [profile1] = component.profiles;
    expect(profile1.mostRecentChangeDate).toBe(dates.created);
  });

  it('should set the most recent change date to the modified date', () => {
    const profileService = TestBed.inject(V1ActifioGmProfilesService) as any;
    jest.spyOn(profileService, 'v1ActifioGmProfilesGet').mockImplementation(() => {
      const profiles = createProfiles();
      return of(profiles);
    });
    component.ngOnInit();

    const [profile1] = component.profiles;
    expect(profile1.mostRecentChangeDate).toBe(dates.modified);
  });
});
