import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TenantComponent } from './tenant.component';

describe('TenantComponent', () => {
  let component: TenantComponent;
  let fixture: ComponentFixture<TenantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TenantComponent],
    });

    fixture = TestBed.createComponent(TenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a not found message', () => {
    const message = fixture.debugElement.query(By.css('.jumbotron'));
    expect(message.nativeElement.textContent).toBe('404 Not Found');
  });
});
