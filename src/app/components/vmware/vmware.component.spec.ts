import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VmwareComponent } from './vmware.component';
import {
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockTabsComponent,
  MockComponent,
  MockViewFieldComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { MockProvider } from 'src/test/mock-providers';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1DatacentersService, V1VmwareVirtualMachinesService } from 'client';

describe('VmwareComponent', () => {
  let component: VmwareComponent;
  let fixture: ComponentFixture<VmwareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([]), FormsModule, NgxPaginationModule, ReactiveFormsModule],
      declarations: [
        MockComponent({ selector: 'app-priority-group-list', inputs: ['datacenterId'] }),
        MockComponent('app-network-adapter-modal'),
        MockComponent('app-virtual-disk-modal'),
        MockComponent('app-virtual-machine-modal'),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockTabsComponent,
        MockViewFieldComponent,
        VmwareComponent,
        YesNoModalComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        MockProvider(V1DatacentersService),
        MockProvider(V1VmwareVirtualMachinesService),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmwareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
