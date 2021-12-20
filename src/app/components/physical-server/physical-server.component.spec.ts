import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PhysicalServerComponent } from './physical-server.component';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from 'src/test/mock-providers';
import { PhysicalServerModalComponent } from './physical-server-modal/physical-server-modal.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1DatacentersService, V1PhysicalServersService } from 'client';

describe('PhysicalServerComponent', () => {
  let component: PhysicalServerComponent;
  let fixture: ComponentFixture<PhysicalServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgxPaginationModule, RouterTestingModule.withRoutes([])],
      declarations: [
        PhysicalServerComponent,
        PhysicalServerModalComponent,
        YesNoModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(DatacenterContextService),
        MockProvider(V1DatacentersService),
        MockProvider(V1PhysicalServersService),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysicalServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
