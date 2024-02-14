import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeRequestModalComponent } from './change-request-modal.component';
import { IncidentService } from 'src/app/services/incident.service';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('ChangeRequestModalComponent', () => {
  let component: ChangeRequestModalComponent;
  let fixture: ComponentFixture<ChangeRequestModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ChangeRequestModalComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(IncidentService), MockProvider(NgxSmartModalService)],
    });
    fixture = TestBed.createComponent(ChangeRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
