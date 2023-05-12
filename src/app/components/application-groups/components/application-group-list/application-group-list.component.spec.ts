/* tslint:disable:no-string-literal */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { ActifioApplicationGroupDto, V1ActifioRdcApplicationGroupsService } from 'client';
import { ApplicationGroupListComponent, ApplicationGroupView } from './application-group-list.component';
import { MockComponent, MockFontAwesomeComponent } from 'src/test/mock-components';

describe('ApplicationGroupListComponent', () => {
  let component: ApplicationGroupListComponent;
  let fixture: ComponentFixture<ApplicationGroupListComponent>;
  let mockApplicationGroups: ActifioApplicationGroupDto[];

  const ngxSmartModalServiceStub = {
    getModal: jest.fn().mockReturnValue({ onCloseFinished: of(), open: jest.fn() }),
    setModalData: jest.fn(),
  };

  const applicationGroupServiceStub = {
    deleteApplicationGroupApplicationGroup: jest.fn(),
    getApplicationGroupsApplicationGroup: jest.fn(),
  };

  beforeEach(async () => {
    mockApplicationGroups = [
      {
        id: 'test-id-1',
        name: 'Test Application Group 1',
        sequenceOrders: [{ vmMembers: [{}, {}] }, { vmMembers: [{}] }],
      },
      {
        id: 'test-id-2',
        name: 'Test Application Group 2',
        sequenceOrders: [],
      },
    ] as ActifioApplicationGroupDto[];

    await TestBed.configureTestingModule({
      declarations: [
        ApplicationGroupListComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'searchColumns'] }),
        MockComponent('app-yes-no-modal'),
        MockComponent('app-icon-button'),
        MockComponent('app-application-group-modal'),
      ],
      providers: [
        { provide: NgxSmartModalService, useValue: ngxSmartModalServiceStub },
        { provide: V1ActifioRdcApplicationGroupsService, useValue: applicationGroupServiceStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationGroupListComponent);
    component = fixture.componentInstance;
    applicationGroupServiceStub.getApplicationGroupsApplicationGroup.mockReturnValue(of(mockApplicationGroups));
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe from createSubscription in ngOnDestroy', () => {
    component.ngOnDestroy();
  });

  it('should open application group modal', () => {
    const applicationGroupId = '123';

    spyOn(ngxSmartModalServiceStub.getModal('applicationGroupModal'), 'onCloseFinished').and.returnValue(of(null));

    component.openApplicationGroupModal(applicationGroupId);

    expect(ngxSmartModalServiceStub.setModalData).toHaveBeenCalledWith({ id: applicationGroupId }, 'applicationGroupModal');
    expect(ngxSmartModalServiceStub.getModal('applicationGroupModal').open).toHaveBeenCalled();
  });

  it('should display a confirmation modal and delete the application group when confirmed', () => {
    const applicationGroup: ApplicationGroupView = { id: 'test-id', name: 'Test Group', virtualMachineCount: 3 };
    const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
    jest.spyOn(component['rdcApplicationGroupService'], 'deleteApplicationGroupApplicationGroup').mockReturnValue(of({} as any));
    jest.spyOn(component, 'loadApplicationGroups');

    component.deleteApplicationGroup(applicationGroup);

    expect(subscribeToYesNoModalSpy).toHaveBeenCalledTimes(1);
  });
});
