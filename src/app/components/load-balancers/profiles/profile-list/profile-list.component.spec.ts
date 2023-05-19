import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { GetManyLoadBalancerProfileResponseDto, LoadBalancerProfile, Tier, V1LoadBalancerProfilesService } from 'client';
import { ProfileListComponent, ImportProfile, ProfileView } from './profile-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('ProfileListComponent', () => {
  let component: ProfileListComponent;
  let fixture: ComponentFixture<ProfileListComponent>;
  let service: V1LoadBalancerProfilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [
        ProfileListComponent,
        MockComponent('app-profile-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(EntityService),
        MockProvider(NgxSmartModalService),
        MockProvider(TierContextService),
        MockProvider(V1LoadBalancerProfilesService),
      ],
    });

    fixture = TestBed.createComponent(ProfileListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1', name: 'Tier1' } as Tier;
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerProfilesService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map profiles', () => {
    jest.spyOn(service, 'getManyLoadBalancerProfile').mockImplementation(() =>
      of({
        data: [
          { id: '1', name: 'Profile1', provisionedAt: {}, reverseProxy: 'Explicit' },
          { id: '2', name: 'Profile2' },
        ] as LoadBalancerProfile[],
        count: 2,
        total: 2,
        page: 1,
        pageCount: 1,
      } as any),
    );

    component.ngOnInit();

    const [profile1, profile2] = component.profiles.data;
    expect(profile1).toEqual({
      id: '1',
      name: 'Profile1',
      nameView: 'Profile1',
      provisionedAt: {},
      state: 'Provisioned',
      reverseProxy: 'Explicit',
      reverseProxyView: 'Explicit',
    });

    expect(profile2).toEqual({
      id: '2',
      name: 'Profile2',
      nameView: 'Profile2',
      state: 'Not Provisioned',
      reverseProxyView: undefined,
    });
  });

  it('should default profiles to be empty on error', () => {
    component.profiles = {
      data: [{ id: '1', name: 'Profile1' }],
      count: 1,
      total: 1,
      page: 1,
      pageCount: 1,
    } as GetManyLoadBalancerProfileResponseDto;
    jest.spyOn(service, 'getManyLoadBalancerProfile').mockImplementation(() => throwError(''));

    component.ngOnInit();

    expect(component.profiles).toEqual(null);
  });

  it('should import profiles', () => {
    const newProfiles = [{ name: 'Profile1', vrfName: 'Tier1' }, { name: 'Profile2' }] as ImportProfile[];
    const spy = jest.spyOn(service, 'createManyLoadBalancerProfile');

    component.import(newProfiles);

    expect(spy).toHaveBeenCalledWith({
      createManyLoadBalancerProfileDto: {
        bulk: [{ name: 'Profile1', tierId: '1', vrfName: 'Tier1' }, { name: 'Profile2' }],
      },
    });
  });

  it('should delete a profile', () => {
    const entityService = TestBed.inject(EntityService);
    const spy = jest.spyOn(entityService, 'deleteEntity');

    component.delete({} as ProfileView);

    expect(spy).toHaveBeenCalled();
  });

  it('should restore a profile', () => {
    const spy = jest.spyOn(service, 'restoreOneLoadBalancerProfile');

    component.restore({} as ProfileView);
    expect(spy).not.toHaveBeenCalled();

    component.restore({ id: '1', deletedAt: {} } as ProfileView);
    expect(spy).toHaveBeenCalledWith({ id: '1' });
  });

  it('should open the modal to create a profile', () => {
    const ngx = TestBed.inject(NgxSmartModalService);
    const spy = jest.spyOn(ngx, 'open');

    const createButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    createButton.nativeElement.click();

    expect(spy).toHaveBeenCalledWith('profileModal');
  });
});
