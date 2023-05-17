import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { V1NetworkStaticRoutesService } from 'client';
import { StaticRouteModalComponent } from './static-route-modal.component';

describe('StaticRouteModalComponent', () => {
  let component: StaticRouteModalComponent;
  let fixture: ComponentFixture<StaticRouteModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [FormsModule, ReactiveFormsModule],
        declarations: [StaticRouteModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
        providers: [MockProvider(NgxSmartModalService), MockProvider(V1NetworkStaticRoutesService)],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(StaticRouteModalComponent);
          component = fixture.componentInstance;
          fixture.detectChanges();
        });
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Name', () => {
    it('should have a minimum length of 3 and maximum length of 100', () => {
      const { name } = component.form.controls;

      name.setValue('a');
      expect(name.valid).toBe(false);

      name.setValue('a'.repeat(3));
      expect(name.valid).toBe(true);

      name.setValue('a'.repeat(101));
      expect(name.valid).toBe(false);
    });

    it('should not allow invalid characters', () => {
      const { name } = component.form.controls;

      name.setValue('invalid/name!');
      expect(name.valid).toBe(false);
    });
  });
});
