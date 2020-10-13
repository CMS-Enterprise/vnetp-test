import { MockComponent, MockFontAwesomeComponent } from 'src/test/mock-components';
import { ActifioLogicalGroupDto, V1AgmLogicalGroupsService } from 'api_client';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { LogicalGroupListComponent } from './logical-group-list.component';

describe('LogicalGroupListComponent', () => {
  let component: LogicalGroupListComponent;
  let fixture: ComponentFixture<LogicalGroupListComponent>;

  const createLogicalGroups = (): ActifioLogicalGroupDto[] => {
    return Array(400)
      .fill(null)
      .map((val: null, index: number) => {
        return {
          id: `${index + 1}`,
          name: `LogicalGroupName-${index + 1}`,
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
            },
          },
        };
      });
  };

  beforeEach(async(() => {
    const logicalGroupService = {
      v1AgmLogicalGroupsGet: jest.fn(() => of(createLogicalGroups())),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [
        MockComponent({ selector: 'app-table', inputs: ['data', 'config'] }),
        MockFontAwesomeComponent,
        LogicalGroupListComponent,
      ],
      providers: [{ useValue: logicalGroupService, provide: V1AgmLogicalGroupsService }],
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
    const logicalGroupService = TestBed.get(V1AgmLogicalGroupsService);
    const spy = jest.spyOn(logicalGroupService, 'v1AgmLogicalGroupsGet');

    component.ngOnInit();

    expect(spy).toHaveBeenCalledWith();
  });

  it('should map a logical group', () => {
    component.ngOnInit();

    const [logicalGroup1] = component.logicalGroups;
    expect(logicalGroup1).toEqual({
      id: '1',
      name: 'LogicalGroupName-1',
      slaProfileDescription: '--',
      slaTemplateDescription: '--',
      slaProfileName: 'Profile-1',
      slaTemplateName: 'Template-1',
    });
  });
});
