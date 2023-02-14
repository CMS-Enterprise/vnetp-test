import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { ApEndpointGroupModalComponent } from './ap-endpoint-group-modal.component';

describe('ApEndpointGroupModalComponent', () => {
  let component: ApEndpointGroupModalComponent;
  let fixture: ComponentFixture<ApEndpointGroupModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApEndpointGroupModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent],
      imports: [RouterTestingModule, ReactiveFormsModule, HttpClientModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApEndpointGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
