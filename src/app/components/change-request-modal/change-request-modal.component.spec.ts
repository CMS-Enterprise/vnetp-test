import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeRequestModalComponent } from './change-request-modal.component';
import { IncidentService } from 'src/app/services/incident.service';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('ChangeRequestModalComponent', () => {
  let component: ChangeRequestModalComponent;
  let fixture: ComponentFixture<ChangeRequestModalComponent>;

  beforeEach(() => {
    const incidentService = {
      currentIncident: of({}),
    };
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ChangeRequestModalComponent, MockNgxSmartModalComponent],
      providers: [{ provide: IncidentService, useValue: incidentService }, MockProvider(NgxSmartModalService)],
    });
    fixture = TestBed.createComponent(ChangeRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
