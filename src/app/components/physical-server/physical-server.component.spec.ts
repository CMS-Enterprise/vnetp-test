import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysicalServerComponent } from './physical-server.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { PhysicalServerModalComponent } from 'src/app/modals/physical-server-modal/physical-server-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';

const ngx = new NgxSmartModalServiceStub();

describe('PhysicalServerComponent', () => {
  let component: PhysicalServerComponent;
  let fixture: ComponentFixture<PhysicalServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularFontAwesomeModule, NgxSmartModalModule, FormsModule, ReactiveFormsModule],
      declarations: [PhysicalServerComponent, PhysicalServerModalComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhysicalServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
