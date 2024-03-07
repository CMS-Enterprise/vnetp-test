import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockTooltipComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { LoadBalancerVlan, Tier, V1LoadBalancerVlansService } from 'client';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';
import { ImportVlan, VlanListComponent, VlanView } from './vlan-list.component';
import { By } from '@angular/platform-browser';
import { TierContextService } from 'src/app/services/tier-context.service';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('VlanListComponent', () => {
  let component: VlanListComponent;
  let fixture: ComponentFixture<VlanListComponent>;
  let service: V1LoadBalancerVlansService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [
        VlanListComponent,
        MockComponent('app-vlan-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
        MockTooltipComponent,
        MockComponent({
          selector: 'app-standard-component',
          inputs: ['config', 'searchColumns', 'perPage', 'objectType'],
        }),
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(EntityService),
        MockProvider(NgxSmartModalService),
        MockProvider(TierContextService),
        MockProvider(V1LoadBalancerVlansService),
      ],
    });

    fixture = TestBed.createComponent(VlanListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1', name: 'Tier1' } as Tier;
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerVlansService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map vlans', () => {
    jest.spyOn(service, 'getManyLoadBalancerVlan').mockImplementation(() =>
      of({
        data: [
          { id: '1', name: 'VLAN1', provisionedAt: {} },
          { id: '2', name: 'VLAN2' },
        ] as LoadBalancerVlan[],
        count: 2,
        total: 2,
        page: 1,
        pageCount: 1,
      } as any),
    );

    component.ngOnInit();

    const [vlan1, vlan2] = component.vlans.data;
    expect(vlan1).toEqual({
      id: '1',
      name: 'VLAN1',
      nameView: 'VLAN1',
      provisionedAt: {},
      state: 'Provisioned',
    });

    expect(vlan2).toEqual({
      id: '2',
      name: 'VLAN2',
      nameView: 'VLAN2',
      state: 'Not Provisioned',
    });
  });

  // it('should default vlans to be empty on error', () => {
  //   component.vlans = {
  //     data: [{ id: '1', name: 'VLAN1' }],
  //     count: 1,
  //     total: 1,
  //     page: 1,
  //     pageCount: 1,
  //   } as GetManyLoadBalancerVlanResponseDto;
  //   jest.spyOn(service, 'getManyLoadBalancerVlan').mockImplementation(() => throwError(''));

  //   component.ngOnInit();

  //   expect(component.vlans).toEqual(null);
  // });

  it('should import vlans', () => {
    const vlans = [{ name: 'VLAN1', vrfName: 'Tier1' }, { name: 'VLAN2' }] as ImportVlan[];
    const spy = jest.spyOn(service, 'createManyLoadBalancerVlan');

    component.import(vlans);

    expect(spy).toHaveBeenCalledWith({
      createManyLoadBalancerVlanDto: {
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
    const spy = jest.spyOn(service, 'restoreOneLoadBalancerVlan');

    component.restore({} as VlanView);
    expect(spy).not.toHaveBeenCalled();

    component.restore({ id: '1', deletedAt: {} } as VlanView);
    expect(spy).toHaveBeenCalledWith({ id: '1' });
  });

  // it('should open the modal to create a vlan', () => {
  //   const ngx = TestBed.inject(NgxSmartModalService);
  //   const spy = jest.spyOn(ngx, 'open');

  //   const createButton = fixture.debugElement.query(By.css('.btn.btn-success'));
  //   createButton.nativeElement.click();

  //   expect(spy).toHaveBeenCalledWith('vlanModal');
  // });
});
