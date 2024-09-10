import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIdRuntimeComponent } from './app-id-runtime.component';

describe('AppIdRuntimeComponent', () => {
  let component: AppIdRuntimeComponent;
  let fixture: ComponentFixture<AppIdRuntimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppIdRuntimeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppIdRuntimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
