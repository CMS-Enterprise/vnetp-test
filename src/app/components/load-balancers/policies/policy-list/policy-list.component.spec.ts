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
import { PolicyListComponent, ImportPolicy } from './policy-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';

describe('PolicyListComponent', () => {
  let component: PolicyListComponent;
  let fixture: ComponentFixture<PolicyListComponent>;

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
    component.currentTier = { id: '1' } as Tier;
    component.tiers = [component.currentTier];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map policies', () => {
    const policyService = TestBed.inject(V1LoadBalancerPoliciesService);
    jest.spyOn(policyService, 'v1LoadBalancerPoliciesGet').mockImplementation(() => {
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
      provisionedState: 'Provisioned',
      type: 'APM',
    });

    expect(policy2).toEqual({
      id: '2',
      name: 'Policy2',
      provisionedState: 'Not Provisioned',
    });
  });

  it('should import policies', () => {
    component.tiers = [{ id: '1', name: 'Tier1' }] as Tier[];

    const newPolicies = [{ name: 'Policy1', vrfName: 'Tier1' }, { name: 'Policy2' }] as ImportPolicy[];
    const policyService = TestBed.inject(V1LoadBalancerPoliciesService);
    const spy = jest.spyOn(policyService, 'v1LoadBalancerPoliciesBulkPost');

    component.import(newPolicies);

    expect(spy).toHaveBeenCalledWith({
      generatedLoadBalancerPolicyBulkDto: {
        bulk: [{ name: 'Policy1', tierId: '1', vrfName: 'Tier1' }, { name: 'Policy2' }],
      },
    });
  });
});
