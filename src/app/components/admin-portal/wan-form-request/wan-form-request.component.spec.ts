import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WanFormRequestComponent } from './wan-form-request.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { V3GlobalWanFormRequestService } from '../../../../../client/api/v3GlobalWanFormRequest.service';
import { TenantStateService } from '../../../services/tenant-state.service';
import { V1NetworkScopeFormsWanFormService } from '../../../../../client/api/v1NetworkScopeFormsWanForm.service';
import { MockComponent } from '../../../../test/mock-components';
import { of } from 'rxjs';

describe('WanFormRequestComponent', () => {
  let component: WanFormRequestComponent;
  let fixture: ComponentFixture<WanFormRequestComponent>;
  let mockWanFormRequestService;

  beforeEach(async () => {
    mockWanFormRequestService = {
      getManyWanFormRequests: jest.fn().mockReturnValue(of([])),
    };
    await TestBed.configureTestingModule({
      declarations: [WanFormRequestComponent, MockComponent('app-table')],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: NgxSmartModalService, useValue: jest.fn() },
        { provide: V3GlobalWanFormRequestService, useValue: mockWanFormRequestService },
        { provide: TenantStateService, useValue: jest.fn() },
        { provide: V1NetworkScopeFormsWanFormService, useValue: jest.fn() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WanFormRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
