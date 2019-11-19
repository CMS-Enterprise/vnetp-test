import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisImageRepositoryComponent } from './solaris-image-repository.component';

describe('SolarisImageRepositoryComponent', () => {
  let component: SolarisImageRepositoryComponent;
  let fixture: ComponentFixture<SolarisImageRepositoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SolarisImageRepositoryComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisImageRepositoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
