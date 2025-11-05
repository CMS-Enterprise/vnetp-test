import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirewallConfigComponent } from './firewall-config.component';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';

describe('FirewallConfigComponent', () => {
  let component: FirewallConfigComponent;
  let fixture: ComponentFixture<FirewallConfigComponent>;
  let data$: Subject<any>;
  let mockRoute: any;

  beforeEach(async () => {
    data$ = new Subject<any>();
    mockRoute = { data: data$.asObservable() } as Partial<ActivatedRoute> as any;

    await TestBed.configureTestingModule({
      declarations: [FirewallConfigComponent],
      imports: [RouterTestingModule],
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
    data$.next({});
    expect(component.firewallType).toBeUndefined();
    expect(component.firewallName).toBeUndefined();
  });

  it('ngOnInit maps all params when present', () => {
    fixture.detectChanges();
    data$.next({
      firewall: {
        firewall: { name: 'FW-1' },
        firewallType: 'external-firewall',
      },
    });
    expect(component.firewallType).toBe('external-firewall');
    expect(component.firewallName).toBe('FW-1');
  });

  it('responds to multiple emissions and applies defaults per emission', () => {
    fixture.detectChanges();
    // First emission: set values
    data$.next({
      firewall: {
        firewall: { name: 'Alpha' },
        firewallType: 'internal',
      },
    });
    expect(component.firewallType).toBe('internal');
    expect(component.firewallName).toBe('Alpha');

    // Second emission: partial/empty -> defaults applied
    data$.next({});
    expect(component.firewallType).toBeUndefined();
    expect(component.firewallName).toBeUndefined();
  });
});
