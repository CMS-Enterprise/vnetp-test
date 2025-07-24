import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { V3GlobalEnvironmentService } from 'client';
import { of } from 'rxjs';

import { EnvironmentModalComponent } from './environment-modal.component';

describe('EnvironmentModalComponent', () => {
  let component: EnvironmentModalComponent;
  let fixture: ComponentFixture<EnvironmentModalComponent>;
  let mockEnvironmentService: jasmine.SpyObj<V3GlobalEnvironmentService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('V3GlobalEnvironmentService', ['getOneEnvironment', 'createOneEnvironment', 'updateOneEnvironment']);

    await TestBed.configureTestingModule({
      declarations: [EnvironmentModalComponent],
      imports: [ReactiveFormsModule, NgxSmartModalModule.forRoot()],
      providers: [{ provide: V3GlobalEnvironmentService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(EnvironmentModalComponent);
    component = fixture.componentInstance;
    mockEnvironmentService = TestBed.inject(V3GlobalEnvironmentService) as jasmine.SpyObj<V3GlobalEnvironmentService>;

    // Setup default mock responses
    mockEnvironmentService.getOneEnvironment.and.returnValue(
      of({
        id: '1',
        name: 'Test Environment',
        description: 'Test Description',
        externalVrfs: [],
        lastRouteSyncAt: new Date().toISOString(),
        globalExternalRoutes: [],
      }),
    );
    mockEnvironmentService.createOneEnvironment.and.returnValue(of({} as any));
    mockEnvironmentService.updateOneEnvironment.and.returnValue(of({} as any));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build form on init', () => {
    component.ngOnInit();
    expect(component.form).toBeDefined();
    expect(component.form.get('name')).toBeDefined();
    expect(component.form.get('description')).toBeDefined();
    expect(component.form.get('externalVrfs')).toBeDefined();
  });

  it('should have VRF options available', () => {
    expect(component.vrfOptions.length).toBeGreaterThan(0);
    expect(component.vrfOptions[0]).toHaveProperty('value');
    expect(component.vrfOptions[0]).toHaveProperty('label');
  });
});
