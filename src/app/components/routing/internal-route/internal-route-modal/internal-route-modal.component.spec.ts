import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import {
  AppCentricSubnet,
  ExternalVrfConnection,
  V1NetworkSubnetsService,
  V2AppCentricAppCentricSubnetsService,
  V2AppCentricVrfsService,
  V2RoutingInternalRoutesService,
  V3GlobalEnvironmentsService,
} from '../../../../../../client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { DatacenterContextService } from '../../../../services/datacenter-context.service';
import { InternalRouteModalComponent } from './internal-route-modal.component';

describe('InternalRouteModalComponent', () => {
  let component: InternalRouteModalComponent;
  let fixture: ComponentFixture<InternalRouteModalComponent>;

  let ngx: any;
  let internalRouteService: any;
  let datacenterContextService: any;
  let netcentricSubnetService: any;
  let appcentricSubnetService: any;
  let environmentService: any;
  let route: any;
  let vrfService: any;

  beforeEach(async () => {
    ngx = {
      close: jest.fn(),
      resetModalData: jest.fn(),
      getModalData: jest.fn().mockReturnValue({}),
    } as Partial<NgxSmartModalService> as any;

    internalRouteService = {
      createOneInternalRoute: jest.fn().mockReturnValue(of({})),
      updateOneInternalRoute: jest.fn().mockReturnValue(of({})),
    } as Partial<V2RoutingInternalRoutesService> as any;

    datacenterContextService = {
      currentDatacenter: new BehaviorSubject<any>(null),
    } as Partial<DatacenterContextService> as any;

    netcentricSubnetService = {
      getSubnetsByDatacenterIdSubnet: jest.fn().mockReturnValue(of([{ id: 'n1' }])),
    } as Partial<V1NetworkSubnetsService> as any;

    appcentricSubnetService = {
      getManyAppCentricSubnet: jest.fn().mockReturnValue(of([{ id: 'a1', bridgeDomain: { id: 'bd1' } } as unknown as AppCentricSubnet])),
    } as Partial<V2AppCentricAppCentricSubnetsService> as any;

    environmentService = {
      getOneEnvironment: jest.fn().mockReturnValue(of({ externalVrfs: [] })),
    } as Partial<V3GlobalEnvironmentsService> as any;

    route = {
      snapshot: { data: {} },
    } as Partial<ActivatedRoute> as any;

    vrfService = {} as Partial<V2AppCentricVrfsService> as any;

    await TestBed.configureTestingModule({
      declarations: [InternalRouteModalComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: NgxSmartModalService, useValue: ngx },
        { provide: V2RoutingInternalRoutesService, useValue: internalRouteService },
        { provide: DatacenterContextService, useValue: datacenterContextService },
        { provide: V1NetworkSubnetsService, useValue: netcentricSubnetService },
        { provide: V2AppCentricAppCentricSubnetsService, useValue: appcentricSubnetService },
        { provide: V3GlobalEnvironmentsService, useValue: environmentService },
        { provide: ActivatedRoute, useValue: route },
        { provide: V2AppCentricVrfsService, useValue: vrfService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InternalRouteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('buildForm creates controls', () => {
    component.buildForm();
    expect(component.form.contains('netcentricSubnetId')).toBe(true);
    expect(component.form.contains('appcentricSubnetId')).toBe(true);
  });

  it('reset clears submitted and rebuilds form and resets modal data', () => {
    component.submitted = true;
    component.reset();
    expect(component.submitted).toBe(false);
    expect(ngx.resetModalData).toHaveBeenCalledWith('internalRouteModal');
    expect(component.form).toBeDefined();
  });

  it('closeModal resets and closes modal', () => {
    const spy = jest.spyOn(component, 'reset');
    component.closeModal();
    expect(spy).toHaveBeenCalled();
    expect(ngx.close).toHaveBeenCalledWith('internalRouteModal');
  });

  it('getSubnetsByApplicationMode loads netcentric subnets', () => {
    (component as any).applicationMode = 'netcentric';
    (datacenterContextService.currentDatacenter as BehaviorSubject<any>).next({ id: 'dc1' });
    component.getSubnetsByApplicationMode();
    expect(netcentricSubnetService.getSubnetsByDatacenterIdSubnet).toHaveBeenCalledWith({ datacenterId: 'dc1' });
  });

  it('getSubnetsByApplicationMode loads appcentric subnets when not netcentric', () => {
    (component as any).applicationMode = 'appcentric';
    component.tenantId = 'tenant-1';
    component.getSubnetsByApplicationMode();
    expect(appcentricSubnetService.getManyAppCentricSubnet).toHaveBeenCalledWith({
      filter: ['tenantId||eq||tenant-1'],
      relations: ['tenant', 'bridgeDomain'],
    });
  });

  it('buildVrfOptions returns early when no externalVrfConnection', () => {
    (component as any).vrfOptions = [];
    (component as any)['buildVrfOptions']();
    expect(component.vrfOptions).toEqual([]);
  });

  it('getData initializes dto, creation path enables controls', () => {
    // setup form and extra control used in getData
    component.buildForm();
    (component.form as any).addControl('exportedToVrfs', new FormControl(''));

    const dto = {
      externalVrfConnection: { id: 'conn-1', externalFirewall: { externalVrfConnections: [] } } as unknown as ExternalVrfConnection,
      modalMode: 'Create',
      tenantId: 'tenant-1',
    };
    ngx.getModalData.mockReturnValue(dto);
    component.getData();
    expect(component.externalVrfConnection.id).toBe('conn-1');
    expect(component.modalMode).toBe('Create');
    expect(component.tenantId).toBe('tenant-1');
    expect(component.form.controls.netcentricSubnetId.enabled).toBe(true);
    expect(component.form.controls.appcentricSubnetId.enabled).toBe(true);
  });

  it('getData edit path sets internalRouteId and disables controls when internalRoute present', () => {
    component.buildForm();
    (component.form as any).addControl('exportedToVrfs', new FormControl(''));
    const dto = {
      externalVrfConnection: { id: 'conn-1', externalFirewall: { externalVrfConnections: [] } } as unknown as ExternalVrfConnection,
      modalMode: 'Edit',
      tenantId: 'tenant-1',
      internalRoute: { id: 'ir-1', appcentricSubnetId: 'a1' },
    };
    ngx.getModalData.mockReturnValue(dto);
    component.getData();
    expect(component.internalRouteId).toBe('ir-1');
    expect(component.form.controls.appcentricSubnetId.disabled).toBe(true);
  });

  it('save returns when form invalid', () => {
    component.buildForm();
    jest.spyOn<any, any>(component as any, 'closeModal');
    component.form.setErrors({ invalid: true });
    component.save();
    expect(internalRouteService.createOneInternalRoute).not.toHaveBeenCalled();
  });

  it('save create flow calls createOneInternalRoute and closes', () => {
    component.buildForm();
    (component as any).datacenterId = 'dc1';
    (component as any).tenantId = 'tenant-1';
    component.externalVrfConnection = { id: 'conn-1' } as ExternalVrfConnection;
    component.form.setValue({ netcentricSubnetId: '', appcentricSubnetId: 'a1' });
    (component as any).modalMode = 'Create';
    const spyClose = jest.spyOn(component, 'closeModal');
    component.save();
    expect(internalRouteService.createOneInternalRoute).toHaveBeenCalledWith({
      internalRoute: {
        externalVrfConnectionId: 'conn-1',
        datacenterId: 'dc1',
        netcentricSubnetId: null,
        appcentricSubnetId: 'a1',
        tenantId: 'tenant-1',
      },
    });
    expect(spyClose).toHaveBeenCalled();
  });

  it('save edit flow strips immutable fields and calls updateOneInternalRoute', () => {
    component.buildForm();
    (component as any).datacenterId = 'dc1';
    (component as any).tenantId = 'tenant-1';
    (component as any).internalRouteId = 'ir-1';
    component.externalVrfConnection = { id: 'conn-1' } as ExternalVrfConnection;
    component.form.setValue({ netcentricSubnetId: '', appcentricSubnetId: 'a1' });
    (component as any).modalMode = 'Edit';
    const spyClose = jest.spyOn(component, 'closeModal');
    component.save();
    expect(internalRouteService.updateOneInternalRoute).toHaveBeenCalledWith({
      id: 'ir-1',
      internalRoute: {
        datacenterId: 'dc1',
        netcentricSubnetId: null,
      },
    });
    expect(spyClose).toHaveBeenCalled();
  });

  it('getNetcentricSubnets assigns available subnets', () => {
    (component as any).datacenterId = 'dc1';
    component.getNetcentricSubnets();
    expect(netcentricSubnetService.getSubnetsByDatacenterIdSubnet).toHaveBeenCalledWith({ datacenterId: 'dc1' });
    expect(component.availableNetcentricSubnets?.length).toBe(1);
  });

  it('getAppcentricSubnets assigns available appcentric subnets', () => {
    component.tenantId = 'tenant-1';
    component.getAppcentricSubnets();
    expect(appcentricSubnetService.getManyAppCentricSubnet).toHaveBeenCalledWith({
      filter: ['tenantId||eq||tenant-1'],
      relations: ['tenant', 'bridgeDomain'],
    });
    expect(component.availableAppcentricSubnets?.length).toBe(1);
  });
});
