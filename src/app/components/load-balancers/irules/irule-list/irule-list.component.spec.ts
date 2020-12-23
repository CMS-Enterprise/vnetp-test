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
import { LoadBalancerIrule, Tier, V1LoadBalancerIrulesService } from 'api_client';
import { IRuleListComponent, ImportIRule, IRuleView } from './irule-list.component';
import { EntityService } from 'src/app/services/entity.service';
import { of } from 'rxjs';

describe('IRuleListComponent', () => {
  let component: IRuleListComponent;
  let fixture: ComponentFixture<IRuleListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        IRuleListComponent,
        MockComponent('app-irule-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [MockProvider(EntityService), MockProvider(V1LoadBalancerIrulesService), MockProvider(NgxSmartModalService)],
    });

    fixture = TestBed.createComponent(IRuleListComponent);
    component = fixture.componentInstance;
    component.currentTier = { id: '1' } as Tier;
    component.tiers = [component.currentTier];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map iRules', () => {
    const service = TestBed.inject(V1LoadBalancerIrulesService);
    jest.spyOn(service, 'v1LoadBalancerIrulesGet').mockImplementation(() => {
      return of(([
        { id: '1', name: 'iRule1', provisionedAt: {} },
        { id: '2', name: 'iRule2', description: 'Description' },
      ] as LoadBalancerIrule[]) as any);
    });

    component.ngOnInit();

    const [iRule1, iRule2] = component.iRules;
    expect(iRule1).toEqual({
      description: undefined,
      descriptionView: '--',
      id: '1',
      name: 'iRule1',
      provisionedAt: {},
      provisionedState: 'Provisioned',
    });

    expect(iRule2).toEqual({
      description: 'Description',
      descriptionView: 'Description',
      id: '2',
      name: 'iRule2',
      provisionedState: 'Not Provisioned',
    });
  });

  it('should import iRules', () => {
    component.tiers = [{ id: '1', name: 'Tier1' }] as Tier[];

    const newIRules = [{ name: 'iRule1', vrfName: 'Tier1' }, { name: 'iRule2' }] as ImportIRule[];
    const service = TestBed.inject(V1LoadBalancerIrulesService);
    const spy = jest.spyOn(service, 'v1LoadBalancerIrulesBulkPost');

    component.import(newIRules);

    expect(spy).toHaveBeenCalledWith({
      generatedLoadBalancerIruleBulkDto: {
        bulk: [{ name: 'iRule1', tierId: '1', vrfName: 'Tier1' }, { name: 'iRule2' }],
      },
    });
  });

  it('should delete a iRule', () => {
    const service = TestBed.inject(EntityService);
    const spy = jest.spyOn(service, 'deleteEntity');

    component.delete({} as IRuleView);

    expect(spy).toHaveBeenCalled();
  });

  it('should restore a iRule', () => {
    const service = TestBed.inject(V1LoadBalancerIrulesService);
    const spy = jest.spyOn(service, 'v1LoadBalancerIrulesIdRestorePatch');

    component.restore({} as IRuleView);
    expect(spy).not.toHaveBeenCalled();

    component.restore({ id: '1', deletedAt: {} } as IRuleView);
    expect(spy).toHaveBeenCalledWith({ id: '1' });
  });
});
