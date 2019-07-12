import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkTopologyComponent } from './network-topology.component';
import { D3GraphComponent } from '../d3-graph/d3-graph.component';
import { HttpClient } from 'selenium-webdriver/http';
import { HttpHandler } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

describe('NetworkTopologyComponent', () => {
  let component: NetworkTopologyComponent;
  let fixture: ComponentFixture<NetworkTopologyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkTopologyComponent, D3GraphComponent],
      providers: [HttpClient, HttpHandler, CookieService]
    })
    .compileComponents();
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
