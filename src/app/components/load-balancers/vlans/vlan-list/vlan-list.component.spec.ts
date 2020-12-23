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
import { LoadBalancerVlan, Tier, V1LoadBalancerVlansService } from 'api_client';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';
import { ImportVlan, VlanListComponent, VlanView } from './vlan-list.component';

describe('VlanListComponent', () => {
  let component: VlanListComponent;
  let fixture: ComponentFixture<VlanListComponent>;
  let service: V1LoadBalancerVlansService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        VlanListComponent,
        MockComponent('app-vlan-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [MockProvider(EntityService), MockProvider(V1LoadBalancerVlansService), MockProvider(NgxSmartModalService)],
    });

    fixture = TestBed.createComponent(VlanListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1', name: 'Tier1' } as Tier;
    component.tiers = [component.currentTier];
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerVlansService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map vlans', () => {
    jest.spyOn(service, 'v1LoadBalancerVlansGet').mockImplementation(() => {
      return of(([
        { id: '1', name: 'VLAN1', provisionedAt: {} },
        { id: '2', name: 'VLAN2' },
      ] as LoadBalancerVlan[]) as any);
    });

    component.ngOnInit();

    const [vlan1, vlan2] = component.vlans;
    expect(vlan1).toEqual({
      id: '1',
      name: 'VLAN1',
      provisionedAt: {},
      state: 'Provisioned',
    });

    expect(vlan2).toEqual({
      id: '2',
      name: 'VLAN2',
      state: 'Not Provisioned',
    });
  });

  it('should import vlans', () => {
    const vlans = [{ name: 'VLAN1', vrfName: 'Tier1' }, { name: 'VLAN2' }] as ImportVlan[];
    const spy = jest.spyOn(service, 'v1LoadBalancerVlansBulkPost');

    component.import(vlans);

    expect(spy).toHaveBeenCalledWith({
      generatedLoadBalancerVlanBulkDto: {
        bulk: [{ name: 'VLAN1', tierId: '1', vrfName: 'Tier1' }, { name: 'VLAN2' }],
      },
    });
  });

  it('should delete a vlan', () => {
    const entityService = TestBed.inject(EntityService);
    const spy = jest.spyOn(entityService, 'deleteEntity');

    component.delete({} as VlanView);

    expect(spy).toHaveBeenCalled();
  });

  it('should restore a vlan', () => {
    const spy = jest.spyOn(service, 'v1LoadBalancerVlansIdRestorePatch');

    component.restore({} as VlanView);
    expect(spy).not.toHaveBeenCalled();

    component.restore({ id: '1', deletedAt: {} } as VlanView);
    expect(spy).toHaveBeenCalledWith({ id: '1' });
  });
});
