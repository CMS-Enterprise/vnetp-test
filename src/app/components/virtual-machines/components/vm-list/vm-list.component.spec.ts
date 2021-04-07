import { DatePipe } from '@angular/common';
import { MockComponent, MockFontAwesomeComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { V1ActifioGmApplicationsService, V1ActifioGmJobsService } from 'api_client';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { from, of } from 'rxjs';
import { VmListComponent } from './vm-list.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('VmListComponent', () => {
  let component: VmListComponent;
  let fixture: ComponentFixture<VmListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [
        MockComponent({ selector: 'app-table', inputs: ['data', 'config'] }),
        MockComponent('app-vm-discovery-modal'),
        MockFontAwesomeComponent,
        VmListComponent,
      ],
      providers: [
        MockProvider(V1ActifioGmApplicationsService),
        MockProvider(V1ActifioGmJobsService),
        DatePipe,
        MockProvider(NgxSmartModalService),
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(VmListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  const createApplications = () => {
    return Array(400)
      .fill(null)
      .map((val: null, index: number) => {
        return {
          id: `${index + 1}`,
          name: `VM: ${index + 1}`,
        };
      });
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should call to get applications in chunks on init', () => {
  //   const applicationService = TestBed.inject(V1ActifioGmApplicationsService) as any;
  //   const spy = jest.spyOn(applicationService, 'v1ActifioGmApplicationsGet').mockImplementation(() => from([createApplications()]));

  //   component.ngOnInit();

  //   expect(spy).toHaveBeenCalledWith({});
  // });

  it('should default to get the last sync date when jobs are empty', done => {
    const applicationService = TestBed.inject(V1ActifioGmApplicationsService) as any;
    jest.spyOn(applicationService, 'v1ActifioGmApplicationsGet').mockImplementation(() => from([createApplications()]));

    const jobService = TestBed.inject(V1ActifioGmJobsService) as any;
    jest.spyOn(jobService, 'v1ActifioGmJobsGet').mockImplementation(() => of([]));

    component.ngOnInit();

    const [vm1] = component.virtualMachines;

    vm1.lastSyncDate.subscribe((date: string) => {
      expect(date).toBe('--');
      done();
    });
  });

  it('should call to get the last sync date for each VM', done => {
    const applicationService = TestBed.inject(V1ActifioGmApplicationsService) as any;
    jest.spyOn(applicationService, 'v1ActifioGmApplicationsGet').mockImplementation(() => from([createApplications()]));

    const jobService = TestBed.inject(V1ActifioGmJobsService) as any;
    jest.spyOn(jobService, 'v1ActifioGmJobsGet').mockImplementation(() => of([{ endDate: new Date('1/1/70, 12:00:00 AM').toUTCString() }]));

    component.ngOnInit();

    const [vm1] = component.virtualMachines;

    vm1.lastSyncDate.subscribe((date: string) => {
      expect(date).toBe('1/1/70, 12:00:00 AM');
      done();
    });
  });

  it('should call to open the discovery modal when "Discover Virtual Machines" is clicked', () => {
    const ngx = TestBed.inject(NgxSmartModalService) as any;
    const openSpy = jest.fn();
    const spy = jest.spyOn(ngx, 'getModal').mockImplementation(() => {
      return { open: openSpy };
    });

    const discoverButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    discoverButton.nativeElement.click();

    expect(spy).toHaveBeenCalledWith('vmDiscoveryModal');
    expect(openSpy).toHaveBeenCalled();
  });
});
