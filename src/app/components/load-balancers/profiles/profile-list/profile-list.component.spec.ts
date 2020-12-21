import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { LoadBalancerProfile, Tier, V1LoadBalancerProfilesService } from 'api_client';
import { ProfileListComponent, ImportProfile } from './profile-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';

describe('ProfileListComponent', () => {
  let component: ProfileListComponent;
  let fixture: ComponentFixture<ProfileListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProfileListComponent,
        MockComponent('app-profile-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [MockProvider(EntityService), MockProvider(V1LoadBalancerProfilesService), MockProvider(NgxSmartModalService)],
    });

    fixture = TestBed.createComponent(ProfileListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1' } as Tier;
    component.tiers = [component.currentTier];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map health monitors', () => {
    const profileService = TestBed.inject(V1LoadBalancerProfilesService);
    const spy = jest.spyOn(profileService, 'v1LoadBalancerProfilesGet').mockImplementation(() => {
      return of(([
        { id: '1', name: 'Profile1', provisionedAt: {} },
        { id: '2', name: 'Profile2' },
      ] as LoadBalancerProfile[]) as any);
    });

    component.ngOnInit();

    const [profile1, profile2] = component.profiles;
    expect(profile1).toEqual({
      id: '1',
      name: 'Profile1',
      provisionedAt: {},
      provisionedState: 'Provisioned',
    });

    expect(profile2).toEqual({
      id: '2',
      name: 'Profile2',
      provisionedState: 'Not Provisioned',
    });
  });

  it('should import health monitors', () => {
    component.tiers = [{ id: '1', name: 'Tier1' }] as Tier[];

    const newProfiles = [{ name: 'Profile1', vrfName: 'Tier1' }, { name: 'Profile2' }] as ImportProfile[];
    const profileService = TestBed.inject(V1LoadBalancerProfilesService);
    const spy = jest.spyOn(profileService, 'v1LoadBalancerProfilesBulkPost');

    component.import(newProfiles);

    expect(spy).toHaveBeenCalledWith({
      generatedLoadBalancerProfileBulkDto: {
        bulk: [{ name: 'Profile1', tierId: '1', vrfName: 'Tier1' }, { name: 'Profile2' }],
      },
    });
  });
});
