import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'src/test/mock-components';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalServiceStub } from 'src/test/modal-mock';
import { NatRulesLandingComponent } from './nat-rules-landing.component';

describe('NatRulesLandingComponent', () => {
  let component: NatRulesLandingComponent;
  let fixture: ComponentFixture<NatRulesLandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [NatRulesLandingComponent, MockComponent({ selector: 'app-tier-select' })],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(NatRulesLandingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
