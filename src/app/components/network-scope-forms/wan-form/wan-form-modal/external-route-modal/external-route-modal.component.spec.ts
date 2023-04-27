import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalRouteModalComponent } from './external-route-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ReactiveFormsModule } from '@angular/forms';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';

describe('ExternalRouteModalComponent', () => {
  let component: ExternalRouteModalComponent;
  let fixture: ComponentFixture<ExternalRouteModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExternalRouteModalComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      imports: [HttpClientModule, ReactiveFormsModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalRouteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
