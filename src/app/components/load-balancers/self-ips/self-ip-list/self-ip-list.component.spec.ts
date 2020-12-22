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
import { LoadBalancerSelfIP, Tier, V1LoadBalancerSelfIPsService } from 'api_client';
import { SelfIPListComponent, ImportSelfIP } from './self-ip-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';

describe('SelfIPListComponent', () => {
  let component: SelfIPListComponent;
  let fixture: ComponentFixture<SelfIPListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SelfIPListComponent,
        MockComponent('app-self-ip-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [MockProvider(EntityService), MockProvider(V1LoadBalancerSelfIPsService), MockProvider(NgxSmartModalService)],
    });

    fixture = TestBed.createComponent(SelfIPListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1' } as Tier;
    component.tiers = [component.currentTier];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map health monitors', () => {
    const selfIPService = TestBed.inject(V1LoadBalancerSelfIPsService);
    const spy = jest.spyOn(selfIPService, 'v1LoadBalancerSelfIPsGet').mockImplementation(() => {
      return of(([
        { id: '1', name: 'SelfIP1', provisionedAt: {} },
        { id: '2', name: 'SelfIP2' },
      ] as LoadBalancerSelfIP[]) as any);
    });

    component.ngOnInit();

    const [selfIP1, selfIP2] = component.selfIPs;
    expect(selfIP1).toEqual({
      id: '1',
      name: 'SelfIP1',
      provisionedAt: {},
      provisionedState: 'Provisioned',
    });

    expect(selfIP2).toEqual({
      id: '2',
      name: 'SelfIP2',
      provisionedState: 'Not Provisioned',
    });
  });

  it('should import health monitors', () => {
    component.tiers = [{ id: '1', name: 'Tier1' }] as Tier[];

    const newSelfIPs = [{ name: 'SelfIP1', vrfName: 'Tier1' }, { name: 'SelfIP2' }] as ImportSelfIP[];
    const selfIPService = TestBed.inject(V1LoadBalancerSelfIPsService);
    const spy = jest.spyOn(selfIPService, 'v1LoadBalancerSelfIPsBulkPost');

    component.import(newSelfIPs);

    expect(spy).toHaveBeenCalledWith({
      generatedLoadBalancerSelfIPBulkDto: {
        bulk: [{ name: 'SelfIP1', tierId: '1', vrfName: 'Tier1' }, { name: 'SelfIP2' }],
      },
    });
  });
});
