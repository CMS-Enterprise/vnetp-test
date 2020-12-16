import { MockComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockYesNoModalComponent } from 'src/test/mock-components';
import { ActifioLogicalGroupDto, V1ActifioGmLogicalGroupsService } from 'api_client';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { LogicalGroupListComponent } from './logical-group-list.component';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { ToastrService } from 'ngx-toastr';

describe('LogicalGroupListComponent', () => {
  let component: LogicalGroupListComponent;
  let fixture: ComponentFixture<LogicalGroupListComponent>;

  const createLogicalGroups = (): ActifioLogicalGroupDto[] => {
    return Array(400)
      .fill(null)
      .map((_, index: number) => {
        return {
          id: `${index + 1}`,
          name: `LogicalGroup-${index + 1}`,
          sourceClusterId: `sourceClusterId-${index + 1}`,
          sla: {
            id: `${index + 1}-1`,
            template: {
              id: `${index + 1}-1-1`,
              name: `Template-${index + 1}`,
            },
            profile: {
              id: `${index + 1}-1-2`,
              name: `Profile-${index + 1}`,
              remoteClusterName: '',
              localClusterName: '',
              lastModifiedDate: '',
              createdDate: '',
              sourceClusterId: `sourceClusterId-${index + 1}`,
            },
          },
        };
      });
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [
        MockComponent({ selector: 'app-table', inputs: ['data', 'config'] }),
        MockComponent('app-logical-group-modal'),
        MockComponent({ selector: 'app-logical-group-view-modal', inputs: ['logicalGroup'] }),
        MockYesNoModalComponent,
        MockIconButtonComponent,
        MockFontAwesomeComponent,
        LogicalGroupListComponent,
      ],
      providers: [
        MockProvider(V1ActifioGmLogicalGroupsService, {
          v1ActifioGmLogicalGroupsGet: of(createLogicalGroups()),
          v1ActifioGmLogicalGroupsIdGet: of({ members: [] }),
        }),
        MockProvider(NgxSmartModalService),
        MockProvider(ToastrService),
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(LogicalGroupListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call to get logical groups on init', () => {
    const logicalGroupService = TestBed.inject(V1ActifioGmLogicalGroupsService);
    const spy = jest.spyOn(logicalGroupService, 'v1ActifioGmLogicalGroupsGet');

    component.ngOnInit();

    expect(spy).toHaveBeenCalled();
  });

  it('should map a logical group', () => {
    component.ngOnInit();

    const [logicalGroup1] = component.logicalGroups;
    expect(logicalGroup1.id).toBe('1');
    expect(logicalGroup1.name).toBe('LogicalGroup-1');
    expect(logicalGroup1.slaProfileName).toBe('Profile-1');
    expect(logicalGroup1.slaTemplateName).toEqual('Template-1');
  });

  it('should delete a single logical group', () => {
    const logicalGroupService = TestBed.inject(V1ActifioGmLogicalGroupsService);
    const deleteSpy = jest.spyOn(logicalGroupService, 'v1ActifioGmLogicalGroupsIdDelete');
    jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((dto, ngx, confirmFn) => {
      confirmFn();
      return of().subscribe();
    });
    component.ngOnInit();
    const [logicalGroup1] = component.logicalGroups;
    component.deleteLogicalGroup(logicalGroup1);

    expect(deleteSpy).toHaveBeenCalledWith({ id: '1' });
  });
});
