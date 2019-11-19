import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkTopologyComponent } from './network-topology.component';
import { D3GraphComponent } from '../d3-graph/d3-graph.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { RouterTestingModule } from '@angular/router/testing';

describe('NetworkTopologyComponent', () => {
  let component: NetworkTopologyComponent;
  let fixture: ComponentFixture<NetworkTopologyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [NetworkTopologyComponent, D3GraphComponent],
      providers: [CookieService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkTopologyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
