import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntraVrfRulesComponent } from './intra-vrf-rules.component';

describe('IntraVrfRulesComponent', () => {
  let component: IntraVrfRulesComponent;
  let fixture: ComponentFixture<IntraVrfRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntraVrfRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntraVrfRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
