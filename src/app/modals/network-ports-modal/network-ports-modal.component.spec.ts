import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkPortsModalComponent } from './network-ports-modal.component';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NgxSmartModalServiceStub } from '../modal-mock';

describe('NetworkPortsModalComponent', () => {
  let component: NetworkPortsModalComponent;
  let fixture: ComponentFixture<NetworkPortsModalComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxSmartModalModule],
      declarations: [NetworkPortsModalComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkPortsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
