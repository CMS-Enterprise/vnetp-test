import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockIconButtonComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { MockProvider } from 'src/test/mock-providers';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import {
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
} from 'client';
import { NatRulePacketTracerComponent } from './nat-rule-packet-tracer.component';

describe('NatRulesPacketTracerComponent', () => {
  let component: NatRulePacketTracerComponent;
  let fixture: ComponentFixture<NatRulePacketTracerComponent>;
  let mockNgxSmartModalService: any;

  beforeEach(() => {
    mockNgxSmartModalService = {
      open: jest.fn(),
      resetModalData: jest.fn(),
      close: jest.fn(),
    };
    TestBed.configureTestingModule({
      imports: [FormsModule, NgxPaginationModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        NatRulePacketTracerComponent,
        ImportExportComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockTooltipComponent,
        NatRulePacketTracerComponent,
      ],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1NetworkSecurityNetworkObjectsService),
        MockProvider(V1NetworkSecurityServiceObjectsService),
      ],
    });

    fixture = TestBed.createComponent(NatRulePacketTracerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
