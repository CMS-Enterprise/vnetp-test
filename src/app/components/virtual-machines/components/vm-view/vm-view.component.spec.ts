import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MockFontAwesomeComponent, MockViewFieldComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { V1ActifioGmApplicationsService, V1ActifioGmJobsService } from 'api_client';
import { VmViewComponent } from './vm-view.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';

describe('VmViewComponent', () => {
  let component: VmViewComponent;
  let fixture: ComponentFixture<VmViewComponent>;

  const paramMapSubject = new Subject<ParamMap>();

  beforeEach(async(() => {
    const mockActivatedRoute = {
      paramMap: paramMapSubject.asObservable(),
    };

    TestBed.configureTestingModule({
      declarations: [VmViewComponent, MockViewFieldComponent, MockFontAwesomeComponent],
      providers: [
        MockProvider(V1ActifioGmApplicationsService),
        MockProvider(V1ActifioGmJobsService),
        DatePipe,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(VmViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call to get a single application based on the param', () => {
    const applicationService = TestBed.inject(V1ActifioGmApplicationsService) as any;
    const spy = jest.spyOn(applicationService, 'v1ActifioGmApplicationsIdGet').mockImplementation(() => of({ id: '1', name: 'Name' }));

    const newParamMap = convertToParamMap({ id: '3' });
    paramMapSubject.next(newParamMap);

    expect(spy).toHaveBeenCalledWith({ id: '3' });
  });

  it('should default the last sync date to "--" when jobs are empty', done => {
    const applicationService = TestBed.inject(V1ActifioGmApplicationsService) as any;
    jest.spyOn(applicationService, 'v1ActifioGmApplicationsIdGet').mockImplementation(() => of({ id: '1', name: 'Name' }));

    const jobService = TestBed.inject(V1ActifioGmJobsService) as any;
    jest.spyOn(jobService, 'v1ActifioGmJobsGet').mockImplementation(() => of([]));

    const newParamMap = convertToParamMap({ id: '3' });
    paramMapSubject.next(newParamMap);

    const { lastSyncDate } = component;
    lastSyncDate.subscribe((date: string) => {
      expect(date).toBe('--');
      done();
    });
  });

  it('should set the last sync date', done => {
    const applicationService = TestBed.inject(V1ActifioGmApplicationsService) as any;
    jest.spyOn(applicationService, 'v1ActifioGmApplicationsIdGet').mockImplementation(() => of({ id: '1', name: 'Name' }));

    const jobService = TestBed.inject(V1ActifioGmJobsService) as any;
    jest.spyOn(jobService, 'v1ActifioGmJobsGet').mockImplementation(() => of([{ endDate: new Date('1/1/70, 12:00:00 AM').toUTCString() }]));

    const newParamMap = convertToParamMap({ id: '3' });
    paramMapSubject.next(newParamMap);

    const { lastSyncDate } = component;
    lastSyncDate.subscribe((date: string) => {
      expect(date).toBe('1/1/70, 12:00:00 AM');
      done();
    });
  });
});
