import { ApplianceComponent } from './appliance.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockYesNoModalComponent,
  MockNgxSmartModalComponent,
  MockComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1DatacentersService, V1AppliancesService } from 'api_client';

describe('ApplianceComponent', () => {
  let component: ApplianceComponent;
  let fixture: ComponentFixture<ApplianceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        ApplianceComponent,
        MockComponent({ selector: 'app-appliance-modal' }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockYesNoModalComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        MockProvider(V1AppliancesService),
        MockProvider(V1DatacentersService),
      ],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
