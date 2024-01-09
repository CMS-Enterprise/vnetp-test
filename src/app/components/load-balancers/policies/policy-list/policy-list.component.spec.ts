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
import { LoadBalancerPolicy, LoadBalancerPolicyTypeEnum, Tier, V1LoadBalancerPoliciesService } from 'client';
import { PolicyListComponent, ImportPolicy, PolicyView } from './policy-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('PolicyListComponent', () => {
  let component: PolicyListComponent;
  let fixture: ComponentFixture<PolicyListComponent>;
  let service: V1LoadBalancerPoliciesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [
        PolicyListComponent,
        MockComponent('app-policy-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
        MockTooltipComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(EntityService),
        MockProvider(NgxSmartModalService),
        MockProvider(TierContextService),
        MockProvider(V1LoadBalancerPoliciesService),
      ],
    });

    fixture = TestBed.createComponent(PolicyListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1', name: 'Tier1' } as Tier;
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerPoliciesService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map policies', () => {
    jest.spyOn(service, 'getManyLoadBalancerPolicy').mockImplementation(() =>
      of({
        data: [
          { id: '1', name: 'Policy1', provisionedAt: {}, type: LoadBalancerPolicyTypeEnum.Apm },
          { id: '2', name: 'Policy2' },
        ] as LoadBalancerPolicy[],
        count: 2,
        total: 2,
        page: 1,
        pageCount: 1,
      } as any),
    );

    component.ngOnInit();

    const [policy1, policy2] = component.policies.data;
    expect(policy1).toEqual({
      id: '1',
      name: 'Policy1',
      nameView: 'Policy1',
      provisionedAt: {},
      state: 'Provisioned',
      type: 'APM',
    });

    expect(policy2).toEqual({
      id: '2',
      name: 'Policy2',
      nameView: 'Policy2',
      state: 'Not Provisioned',
    });
  });

  // it('should default policies to be empty on error', () => {
  //   component.policies = {
  //     data: [{ id: '1', name: 'Policy1' }],
  //     count: 1,
  //     total: 1,
  //     page: 1,
  //     pageCount: 1,
  //   } as GetManyLoadBalancerPolicyResponseDto;
  //   jest.spyOn(service, 'getManyLoadBalancerPolicy').mockImplementation(() => throwError(''));

  //   component.ngOnInit();

  //   expect(component.policies).toEqual(null);
  // });

  it('should import policies', () => {
    const policies = [{ name: 'Policy1', tierName: 'Tier1' }, { name: 'Policy2' }] as ImportPolicy[];
    const spy = jest.spyOn(service, 'createManyLoadBalancerPolicy');

    component.import(policies);

    expect(spy).toHaveBeenCalledWith({
      createManyLoadBalancerPolicyDto: {
        bulk: [{ name: 'Policy1', tierId: '1', tierName: 'Tier1' }, { name: 'Policy2' }],
      },
    });
  });

  it('should delete a policy', () => {
    const entityService = TestBed.inject(EntityService);
    const spy = jest.spyOn(entityService, 'deleteEntity');

    component.delete({} as PolicyView);

    expect(spy).toHaveBeenCalled();
  });

  it('should restore a policy', () => {
    const spy = jest.spyOn(service, 'restoreOneLoadBalancerPolicy');

    component.restore({} as PolicyView);
    expect(spy).not.toHaveBeenCalled();

    component.restore({ id: '1', deletedAt: {} } as PolicyView);
    expect(spy).toHaveBeenCalledWith({ id: '1' });
  });

  it('should open the modal to create a policy', () => {
    const ngx = TestBed.inject(NgxSmartModalService);
    const spy = jest.spyOn(ngx, 'open');

    const createButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    createButton.nativeElement.click();

    expect(spy).toHaveBeenCalledWith('policyModal');
  });
});
