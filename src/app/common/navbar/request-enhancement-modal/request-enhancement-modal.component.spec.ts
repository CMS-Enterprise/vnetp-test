import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AuthService } from 'src/app/services/auth.service';
import { MockProvider } from 'src/test/mock-providers';
import { NavbarComponent } from '../navbar.component';
import { MockComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { RequestEnhancementModalComponent } from './request-enhancement-modal.component';

describe('RequestEnhancementModalComponent', () => {
  let component: RequestEnhancementModalComponent;
  let fixture: ComponentFixture<RequestEnhancementModalComponent>;
  let mockAuthService: Partial<AuthService>;
  let mockNgxSmartModalService: Partial<NgxSmartModalService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequestEnhancementModalComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      imports: [HttpClientModule, FormsModule, ReactiveFormsModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestEnhancementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
