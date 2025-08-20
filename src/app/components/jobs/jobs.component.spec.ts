import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobsComponent } from './jobs.component';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { V1JobsService } from 'client';

describe('JobsComponent', () => {
  let component: JobsComponent;
  let fixture: ComponentFixture<JobsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [JobsComponent, MockFontAwesomeComponent],
      providers: [MockProvider(V1JobsService)],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
