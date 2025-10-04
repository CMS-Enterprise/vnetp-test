import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirewallConfigComponent } from './firewall-config.component';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

describe('FirewallConfigComponent', () => {
  let component: FirewallConfigComponent;
  let fixture: ComponentFixture<FirewallConfigComponent>;
  let queryParams$: Subject<any>;
  let mockRoute: any;

  beforeEach(async () => {
    queryParams$ = new Subject<any>();
    mockRoute = { queryParams: queryParams$.asObservable() } as Partial<ActivatedRoute> as any;

    await TestBed.configureTestingModule({
      declarations: [FirewallConfigComponent],
      providers: [{ provide: ActivatedRoute, useValue: mockRoute }],
    }).compileComponents();

    fixture = TestBed.createComponent(FirewallConfigComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit sets defaults when params missing', () => {
    fixture.detectChanges();
    queryParams$.next({});
    expect(component.firewallType).toBe('unknown');
    expect(component.firewallId).toBe('');
    expect(component.firewallName).toBe('');
    expect(component.serviceGraphId).toBe('');
  });

  it('ngOnInit maps all params when present', () => {
    fixture.detectChanges();
    queryParams$.next({ type: 'external-firewall', firewallId: 'f1', firewallName: 'FW-1', serviceGraphId: 'sg-1' });
    expect(component.firewallType).toBe('external-firewall');
    expect(component.firewallId).toBe('f1');
    expect(component.firewallName).toBe('FW-1');
    expect(component.serviceGraphId).toBe('sg-1');
  });

  it('responds to multiple emissions and applies defaults per emission', () => {
    fixture.detectChanges();
    // First emission: set values
    queryParams$.next({ type: 'internal', firewallId: 'A', firewallName: 'Alpha', serviceGraphId: 'S1' });
    expect(component.firewallType).toBe('internal');
    expect(component.firewallId).toBe('A');
    expect(component.firewallName).toBe('Alpha');
    expect(component.serviceGraphId).toBe('S1');

    // Second emission: partial/empty -> defaults applied
    queryParams$.next({});
    expect(component.firewallType).toBe('unknown');
    expect(component.firewallId).toBe('');
    expect(component.firewallName).toBe('');
    expect(component.serviceGraphId).toBe('');
  });
});
