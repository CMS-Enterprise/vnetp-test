import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplicationStatePanelComponent } from './replication-state-panel.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PapaParseModule } from 'ngx-papaparse';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ReplicationStatePanelComponent', () => {
  let component: ReplicationStatePanelComponent;
  let fixture: ComponentFixture<ReplicationStatePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxChartsModule, NgxPaginationModule, HttpClientTestingModule, PapaParseModule, BrowserAnimationsModule],
      declarations: [ReplicationStatePanelComponent],
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
