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
import { LoadBalancerPolicy, LoadBalancerPolicyType, Tier, V1LoadBalancerPoliciesService } from 'api_client';
import { PolicyListComponent, ImportPolicy, PolicyView } from './policy-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';

describe('PolicyListComponent', () => {
  let component: PolicyListComponent;
  let fixture: ComponentFixture<PolicyListComponent>;
  let service: V1LoadBalancerPoliciesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        PolicyListComponent,
        MockComponent('app-policy-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [MockProvider(EntityService), MockProvider(V1LoadBalancerPoliciesService), MockProvider(NgxSmartModalService)],
    });

    fixture = TestBed.createComponent(PolicyListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1', name: 'Tier1' } as Tier;
    component.tiers = [component.currentTier];
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerPoliciesService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map policies', () => {
    jest.spyOn(service, 'v1LoadBalancerPoliciesGet').mockImplementation(() => {
      return of(([
        { id: '1', name: 'Policy1', provisionedAt: {}, type: LoadBalancerPolicyType.APM },
        { id: '2', name: 'Policy2' },
      ] as LoadBalancerPolicy[]) as any);
    });

    component.ngOnInit();

    const [policy1, policy2] = component.policies;
    expect(policy1).toEqual({
      id: '1',
      name: 'Policy1',
      provisionedAt: {},
      state: 'Provisioned',
      type: 'APM',
    });

    expect(policy2).toEqual({
      id: '2',
      name: 'Policy2',
      state: 'Not Provisioned',
    });
  });

  it('should import policies', () => {
    const policies = [{ name: 'Policy1', vrfName: 'Tier1' }, { name: 'Policy2' }] as ImportPolicy[];
    const spy = jest.spyOn(service, 'v1LoadBalancerPoliciesBulkPost');

    component.import(policies);

    expect(spy).toHaveBeenCalledWith({
      generatedLoadBalancerPolicyBulkDto: {
        bulk: [{ name: 'Policy1', tierId: '1', vrfName: 'Tier1' }, { name: 'Policy2' }],
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
    const spy = jest.spyOn(service, 'v1LoadBalancerPoliciesIdRestorePatch');

    component.restore({} as PolicyView);
    expect(spy).not.toHaveBeenCalled();

    component.restore({ id: '1', deletedAt: {} } as PolicyView);
    expect(spy).toHaveBeenCalledWith({ id: '1' });
  });
});
