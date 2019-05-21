// FIXME: Need to write mock for ngxSmartModal.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { PoolMemberModalComponent } from './pool-member-modal.component';

describe('PoolMemberModalComponent', () => {
  let component: PoolMemberModalComponent;
  let fixture: ComponentFixture<PoolMemberModalComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, NgxSmartModalModule, ReactiveFormsModule, NgxMaskModule.forRoot()],
      declarations: [ PoolMemberModalComponent ],
      providers: [ { provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators]
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(PoolMemberModalComponent);
      component = fixture.componentInstance;
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolMemberModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
