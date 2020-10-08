import { MockComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockYesNoModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { ActifioTemplateDto, V1AgmTemplatesService } from 'api_client';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { from, of } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { TemplateListComponent } from './template-list.component';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

describe('TemplateListComponent', () => {
  let component: TemplateListComponent;
  let fixture: ComponentFixture<TemplateListComponent>;

  beforeEach(async(() => {
    const templateService = {
      v1AgmTemplatesGet: jest.fn(() => of(createTemplates())),
      v1AgmTemplatesIdPolicyGet: jest.fn(() => of({})),
      v1AgmTemplatesIdDelete: jest.fn(() => of({})),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [
        MockComponent({ selector: 'app-table', inputs: ['data', 'config'] }),
        MockComponent({ selector: 'app-template-modal' }),
        MockIconButtonComponent,
        MockFontAwesomeComponent,
        MockYesNoModalComponent,
        TemplateListComponent,
      ],
      providers: [{ useValue: templateService, provide: V1AgmTemplatesService }, MockProvider(NgxSmartModalService)],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TemplateListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  const createTemplates = (): ActifioTemplateDto[] => {
    return Array(400)
      .fill(null)
      .map((val: null, index: number) => {
        return {
          id: `${index + 1}`,
          name: `Name ${index + 1}`,
          policies: [],
          description: `Description ${index + 1}`,
        };
      });
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call to get templates on init', () => {
    const templateService = TestBed.get(V1AgmTemplatesService);
    const spy = jest.spyOn(templateService, 'v1AgmTemplatesGet').mockImplementation(() => of(createTemplates()));

    component.ngOnInit();

    expect(spy).toHaveBeenCalled();
  });

  it('should default an empty description to be "--"', () => {
    const templateService = TestBed.get(V1AgmTemplatesService);
    jest.spyOn(templateService, 'v1AgmTemplatesGet').mockImplementation(() => {
      const templates = createTemplates();
      templates[0].description = undefined;
      return of(templates);
    });
    component.ngOnInit();

    const [template1] = component.templates;
    expect(template1.description).toBe('--');
  });

  it('should set the time window to "--" when a snapshot policy does not exist', done => {
    const templateService = TestBed.get(V1AgmTemplatesService);
    jest.spyOn(templateService, 'v1AgmTemplatesGet').mockImplementation(() => of(createTemplates()));
    jest.spyOn(templateService, 'v1AgmTemplatesIdPolicyGet').mockImplementation(() => of([]));

    component.ngOnInit();

    const [template1] = component.templates;
    template1.snapshotPolicyTimeWindow.subscribe((date: string) => {
      expect(date).toBe('--');
      done();
    });
  });

  it('should set the time window of a template snapshot policy', done => {
    const templateService = TestBed.get(V1AgmTemplatesService);
    jest.spyOn(templateService, 'v1AgmTemplatesGet').mockImplementation(() => of(createTemplates()));
    jest.spyOn(templateService, 'v1AgmTemplatesIdPolicyGet').mockImplementation(() => {
      const snapshotPolicy = {
        startTime: 10 * 60 * 60,
        endTime: 20 * 60 * 60,
      };
      return of([snapshotPolicy]);
    });

    component.ngOnInit();

    const [template1] = component.templates;
    template1.snapshotPolicyTimeWindow.subscribe((date: string) => {
      expect(date).toBe('10:00 to 20:00');
      done();
    });
  });

  it('should call to delete a template after confirming', () => {
    const templateService = TestBed.get(V1AgmTemplatesService);

    jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((dto, ngx, confirmFn, closeFn) => {
      confirmFn();
      return of().subscribe();
    });

    const deleteSpy = jest.spyOn(templateService, 'v1AgmTemplatesIdDelete');

    component.deleteTemplate({ id: '1', name: 'Test' });

    expect(deleteSpy).toHaveBeenCalledWith({ id: '1' });
  });

  it('should call to open the template modal when "Create Template" is clicked', () => {
    const ngx = TestBed.get(NgxSmartModalService);
    const openSpy = jest.fn();
    const spy = jest.spyOn(ngx, 'getModal').mockImplementation(() => {
      return { open: openSpy };
    });

    const createButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    createButton.nativeElement.click();

    expect(spy).toHaveBeenCalledWith('templateModal');
    expect(openSpy).toHaveBeenCalled();
  });
});
