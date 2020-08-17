import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReplicationStatePanelComponent } from './replication-state-panel.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockFontAwesomeComponent } from 'src/test/mock-components';

describe('ReplicationStatePanelComponent', () => {
  let component: ReplicationStatePanelComponent;
  let fixture: ComponentFixture<ReplicationStatePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxChartsModule, NgxPaginationModule, HttpClientTestingModule, BrowserAnimationsModule],
      declarations: [ReplicationStatePanelComponent, MockFontAwesomeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplicationStatePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
