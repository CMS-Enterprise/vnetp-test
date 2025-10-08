import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ExternalVrfRouteDetailComponent } from './external-vrf-route-detail.component';
import { ExternalVrfConnection } from '../../../../../client';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('ExternalVrfRouteDetailComponent', () => {
  let component: ExternalVrfRouteDetailComponent;
  let fixture: ComponentFixture<ExternalVrfRouteDetailComponent>;

  const makeConn = (overrides: Partial<ExternalVrfConnection> = {}): ExternalVrfConnection =>
    ({
      id: 'conn-1',
      name: 'Conn 1',
      allowAllRoutesFromExternalVrf: false,
      injectDefaultRouteFromExternalVrf: false,
      advertiseAllRoutesToExternalVrf: false,
      externalRoutes: [],
      internalRoutes: [],
      externalFirewall: { externalVrfConnections: [] },
      ...overrides,
    } as any);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExternalVrfRouteDetailComponent],
      imports: [MatTooltipModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalVrfRouteDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.externalVrfConnection = makeConn();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('global defaults to false and can be set true then reset to false via undefined', () => {
    expect(component.global).toBe(false);
    component.global = true;
    expect(component.global).toBe(true);
    component.global = undefined;
    expect(component.global).toBe(false);
  });

  it('blockChanges input toggles warning banner text', () => {
    component.externalVrfConnection = makeConn();
    component.blockChanges = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('active route control request');

    component.blockChanges = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      // eslint-disable-next-line max-len
      'block Your route control change request has been approved and must be deployed during a change window. You cannot make new changes until the approved changes are deployed. Advertised Internal Routestune Manage Internal Routes No advertised internal routes.Learned External Routesroute Manage External Routes No learned external routes.',
    );
  });

  it('connection default route/allow-all toggles general warning', () => {
    component.externalVrfConnection = makeConn({ allowAllRoutesFromExternalVrf: false, injectDefaultRouteFromExternalVrf: false });
    component.blockChanges = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('External route management is disabled');

    component.externalVrfConnection = makeConn({ allowAllRoutesFromExternalVrf: true });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('External route management is disabled');
  });

  it('emits manageSubnets and manageRoutes events', done => {
    let subnetsEmitted = false;
    let routesEmitted = false;

    component.manageSubnets.subscribe(() => {
      subnetsEmitted = true;
      if (subnetsEmitted && routesEmitted) {
        done();
      }
    });
    component.manageRoutes.subscribe(() => {
      routesEmitted = true;
      if (subnetsEmitted && routesEmitted) {
        done();
      }
    });

    component.manageSubnets.emit();
    component.manageRoutes.emit();
  });
});
