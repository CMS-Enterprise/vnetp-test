import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { NetworksComponent } from './networks.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { RouterTestingModule } from '@angular/router/testing';
import { ImportExportComponent } from '../import-export/import-export.component';
import { FormsModule } from '@angular/forms';
import { PapaParseModule } from 'ngx-papaparse';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('NetworksComponent', () => {
  let component: NetworksComponent;
  let fixture: ComponentFixture<NetworksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        RouterTestingModule.withRoutes([]),
        FormsModule,
        PapaParseModule,
        HttpClientTestingModule,
      ],
      declarations: [
        NetworksComponent,
        ImportExportComponent,
        TooltipComponent,
      ],
      providers: [CookieService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
