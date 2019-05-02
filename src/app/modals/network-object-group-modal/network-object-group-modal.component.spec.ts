import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkObjectGroupModalComponent } from './network-object-group-modal.component';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

describe('NetworkObjectGroupModalComponent', () => {
  let component: NetworkObjectGroupModalComponent;
  let fixture: ComponentFixture<NetworkObjectGroupModalComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularFontAwesomeModule, NgxSmartModalModule, FormsModule, ReactiveFormsModule],
      declarations: [ NetworkObjectGroupModalComponent ],
      providers: [ { provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkObjectGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
