import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndpointGroupModalComponent } from './endpoint-group-modal.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  V2AppCentricApplicationProfilesService,
  V2AppCentricBridgeDomainsService,
  V2AppCentricEndpointGroupsService,
} from '../../../../../../../../client';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from '../../../../../../../test/mock-components';
import { NgSelectModule } from '@ng-select/ng-select';

describe('EndpointGroupModalComponent', () => {
  let component: EndpointGroupModalComponent;
  let fixture: ComponentFixture<EndpointGroupModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EndpointGroupModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent],
      providers: [
        { provide: FormBuilder, useValue: jest.fn() },
        { provide: NgxSmartModalService, useValue: jest.fn() },
        { provide: V2AppCentricEndpointGroupsService, useValue: jest.fn() },
        { provide: V2AppCentricBridgeDomainsService, useValue: jest.fn() },
        { provide: V2AppCentricApplicationProfilesService, useValue: jest.fn() },
      ],
      imports: [FormsModule, ReactiveFormsModule, NgSelectModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndpointGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
