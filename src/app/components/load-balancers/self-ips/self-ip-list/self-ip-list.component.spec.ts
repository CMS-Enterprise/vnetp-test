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
import { LoadBalancerSelfIp, Tier, V1LoadBalancerSelfIpsService } from 'api_client';
import { SelfIpListComponent, ImportSelfIp } from './self-ip-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';

describe('SelfIpListComponent', () => {
  let component: SelfIpListComponent;
  let fixture: ComponentFixture<SelfIpListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SelfIpListComponent,
        MockComponent('app-self-ip-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [MockProvider(EntityService), MockProvider(V1LoadBalancerSelfIpsService), MockProvider(NgxSmartModalService)],
    });

    fixture = TestBed.createComponent(SelfIpListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1' } as Tier;
    component.tiers = [component.currentTier];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map self ips', () => {
    const selfIPService = TestBed.inject(V1LoadBalancerSelfIpsService);
    jest.spyOn(selfIPService, 'v1LoadBalancerSelfIpsGet').mockImplementation(() => {
      return of(([
        { id: '1', name: 'SelfIp1', provisionedAt: {} },
        { id: '2', name: 'SelfIp2' },
      ] as LoadBalancerSelfIp[]) as any);
    });

    component.ngOnInit();

    const [selfIp1, selfIp2] = component.selfIps;
    expect(selfIp1).toEqual({
      id: '1',
      name: 'SelfIp1',
      provisionedAt: {},
      provisionedState: 'Provisioned',
    });

    expect(selfIp2).toEqual({
      id: '2',
      name: 'SelfIp2',
      provisionedState: 'Not Provisioned',
    });
  });

  it('should import self ips', () => {
    component.tiers = [{ id: '1', name: 'Tier1' }] as Tier[];

    const newSelfIps = [{ name: 'SelfIp1', vrfName: 'Tier1' }, { name: 'SelfIp2' }] as ImportSelfIp[];
    const selfIPService = TestBed.inject(V1LoadBalancerSelfIpsService);
    const spy = jest.spyOn(selfIPService, 'v1LoadBalancerSelfIpsBulkPost');

    component.import(newSelfIps);

    expect(spy).toHaveBeenCalledWith({
      generatedLoadBalancerSelfIpBulkDto: {
        bulk: [{ name: 'SelfIp1', tierId: '1', vrfName: 'Tier1' }, { name: 'SelfIp2' }],
      },
    });
  });
});
