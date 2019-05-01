import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNetworkComponent } from './create-network.component';
import { FormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';

describe('CreateNetworkComponent', () => {
  let component: CreateNetworkComponent;
  let fixture: ComponentFixture<CreateNetworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, NgxMaskModule],
      declarations: [ CreateNetworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
