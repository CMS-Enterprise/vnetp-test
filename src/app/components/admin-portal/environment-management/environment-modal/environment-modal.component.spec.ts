import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { V3GlobalEnvironmentService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of } from 'rxjs';

import { EnvironmentModalComponent } from './environment-modal.component';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { NgxSmartModalModule } from 'ngx-smart-modal';

describe('EnvironmentModalComponent', () => {
  let component: EnvironmentModalComponent;
  let fixture: ComponentFixture<EnvironmentModalComponent>;
  let mockEnvironmentService: Partial<V3GlobalEnvironmentService>;
  let mockNgxSmartModalService: Partial<NgxSmartModalService>;

  beforeEach(async () => {
    mockEnvironmentService = {
      getOneEnvironment: jest.fn().mockReturnValue(of({})),
      createOneEnvironment: jest.fn().mockReturnValue(of({})),
      updateOneEnvironment: jest.fn().mockReturnValue(of({})),
    };

    mockNgxSmartModalService = {
      getModalData: jest.fn().mockReturnValue({}),
      setModalData: jest.fn(),
      getModal: jest.fn().mockReturnValue({
        open: jest.fn(),
        close: jest.fn(),
        onCloseFinished: of({}),
      }),
      close: jest.fn(),
      resetModalData: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [EnvironmentModalComponent, MockFontAwesomeComponent],
      imports: [ReactiveFormsModule, NgxSmartModalModule],
      providers: [
        UntypedFormBuilder,
        { provide: V3GlobalEnvironmentService, useValue: mockEnvironmentService },
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvironmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
