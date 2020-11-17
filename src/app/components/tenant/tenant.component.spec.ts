import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { TenantComponent } from './tenant.component';

describe('TenantComponent', () => {
  let component: TenantComponent;
  let fixture: ComponentFixture<TenantComponent>;

  const userSubject = new Subject();

  beforeEach(async(() => {
    const authService = {
      completeAuthentication: () => true,
      currentUser: userSubject.asObservable(),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [TenantComponent],
      providers: [{ provide: AuthService, useValue: authService }],
    });

    fixture = TestBed.createComponent(TenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
