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
import { LoadBalancerSelfIp, Tier, V1LoadBalancerSelfIpsService } from 'api_client';
import { SelfIpListComponent, ImportSelfIp, SelfIpView } from './self-ip-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';

describe('SelfIpListComponent', () => {
  let component: SelfIpListComponent;
  let fixture: ComponentFixture<SelfIpListComponent>;
  let service: V1LoadBalancerSelfIpsService;

  beforeEach(() => {
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
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(EntityService),
        MockProvider(NgxSmartModalService),
        MockProvider(TierContextService),
        MockProvider(V1LoadBalancerSelfIpsService),
      ],
    });

    fixture = TestBed.createComponent(SelfIpListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1', name: 'Tier1' } as Tier;
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerSelfIpsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map self ips', () => {
    jest.spyOn(service, 'v1LoadBalancerSelfIpsGet').mockImplementation(() => {
      return of(([
        { id: '1', name: 'SelfIp1', provisionedAt: {}, loadBalancerVlan: { name: 'VLAN' } },
        { id: '2', name: 'SelfIp2' },
      ] as LoadBalancerSelfIp[]) as any);
    });

    component.ngOnInit();

    const [selfIp1, selfIp2] = component.selfIps;
    expect(selfIp1).toEqual({
      id: '1',
      name: 'SelfIp1',
      nameView: 'SelfIp1',
      provisionedAt: {},
      state: 'Provisioned',
      loadBalancerVlan: { name: 'VLAN' },
      vlanName: 'VLAN',
    });

    expect(selfIp2).toEqual({
      id: '2',
      name: 'SelfIp2',
      nameView: 'SelfIp2',
      state: 'Not Provisioned',
      vlanName: undefined,
    });
  });

  it('should default self ips to be empty on error', () => {
    component.selfIps = [{ id: '1', name: 'SelfIp1' }] as SelfIpView[];
    jest.spyOn(service, 'v1LoadBalancerSelfIpsGet').mockImplementation(() => throwError(''));

    component.ngOnInit();

    expect(component.selfIps).toEqual([]);
  });

  it('should import self ips', () => {
    const selfIps = [{ name: 'SelfIp1', vrfName: 'Tier1' }, { name: 'SelfIp2' }] as ImportSelfIp[];
    const spy = jest.spyOn(service, 'v1LoadBalancerSelfIpsBulkPost');

    component.import(selfIps);

    expect(spy).toHaveBeenCalledWith({
      generatedLoadBalancerSelfIpBulkDto: {
        bulk: [{ name: 'SelfIp1', tierId: '1', vrfName: 'Tier1' }, { name: 'SelfIp2' }],
      },
    });
  });

  it('should delete a self ip', () => {
    const entityService = TestBed.inject(EntityService);
    const spy = jest.spyOn(entityService, 'deleteEntity');

    component.delete({} as SelfIpView);

    expect(spy).toHaveBeenCalled();
  });

  it('should restore a self ip', () => {
    const spy = jest.spyOn(service, 'v1LoadBalancerSelfIpsIdRestorePatch');

    component.restore({} as SelfIpView);
    expect(spy).not.toHaveBeenCalled();

    component.restore({ id: '1', deletedAt: {} } as SelfIpView);
    expect(spy).toHaveBeenCalledWith({ id: '1' });
  });

  it('should open the modal to create a self ip', () => {
    const ngx = TestBed.inject(NgxSmartModalService);
    const spy = jest.spyOn(ngx, 'open');

    const createButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    createButton.nativeElement.click();

    expect(spy).toHaveBeenCalledWith('selfIpModal');
  });
});
