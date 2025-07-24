import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { V3GlobalEnvironmentService } from 'client';
import { of } from 'rxjs';

import { EnvironmentManagementComponent } from './environment-management.component';

describe('EnvironmentManagementComponent', () => {
  let component: EnvironmentManagementComponent;
  let fixture: ComponentFixture<EnvironmentManagementComponent>;
  let mockEnvironmentService: jasmine.SpyObj<V3GlobalEnvironmentService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('V3GlobalEnvironmentService', ['getManyEnvironments', 'getManyEnvironmentSummaries']);

    await TestBed.configureTestingModule({
      declarations: [EnvironmentManagementComponent],
      imports: [NgxSmartModalModule.forRoot()],
      providers: [{ provide: V3GlobalEnvironmentService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(EnvironmentManagementComponent);
    component = fixture.componentInstance;
    mockEnvironmentService = TestBed.inject(V3GlobalEnvironmentService) as jasmine.SpyObj<V3GlobalEnvironmentService>;

    // Setup default mock responses
    mockEnvironmentService.getManyEnvironments.and.returnValue(of([]));
    mockEnvironmentService.getManyEnvironmentSummaries.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load environments on init', () => {
    component.ngOnInit();
    expect(mockEnvironmentService.getManyEnvironments).toHaveBeenCalled();
    expect(mockEnvironmentService.getManyEnvironmentSummaries).toHaveBeenCalled();
  });
});
