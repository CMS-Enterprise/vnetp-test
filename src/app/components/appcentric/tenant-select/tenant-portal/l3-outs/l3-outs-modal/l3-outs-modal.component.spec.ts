/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { L3OutsModalComponent } from './l3-outs-modal.component';
import {
  V2AppCentricL3outsService,
  V2AppCentricVrfsService,
  V2AppCentricBridgeDomainsService,
  V2AppCentricEndpointGroupsService,
  V2AppCentricEndpointSecurityGroupsService,
} from 'client';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';

describe('L3OutsModalComponent', () => {
  let component: L3OutsModalComponent;
  let fixture: ComponentFixture<L3OutsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        L3OutsModalComponent,
        MockNgxSmartModalComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
      ],
      imports: [RouterTestingModule, HttpClientModule, ReactiveFormsModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(L3OutsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getFormControl = (prop: string): FormControl => component.form.controls[prop] as FormControl;
  const isRequired = (prop: string): boolean => {
    const fc = getFormControl(prop);
    fc.setValue(null);
    return !!fc.errors && !!fc.errors.required;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Name', () => {
    it('should have a minimum length of 3 and maximum length of 100', () => {
      const { name } = component.form.controls;

      name.setValue('a');
      expect(name.valid).toBe(false);

      name.setValue('a'.repeat(3));
      expect(name.valid).toBe(true);

      name.setValue('a'.repeat(101));
      expect(name.valid).toBe(false);
    });

    it('should not allow invalid characters', () => {
      const { name } = component.form.controls;

      name.setValue('invalid/name!');
      expect(name.valid).toBe(false);
    });
  });

  describe('alias', () => {
    it('should have a maximum length of 100', () => {
      const { alias } = component.form.controls;

      alias.setValue('a');
      expect(alias.valid).toBe(true);

      alias.setValue('a'.repeat(101));
      expect(alias.valid).toBe(false);
    });
  });

  describe('description', () => {
    it('should have a maximum length of 500', () => {
      const { description } = component.form.controls;

      description.setValue('a');
      expect(description.valid).toBe(true);

      description.setValue('a'.repeat(501));
      expect(description.valid).toBe(false);
    });
  });

  it('should have correct required and optional fields by default', () => {
    const requiredFields = ['name', 'vrfId'];
    const optionalFields = ['alias', 'description'];

    requiredFields.forEach(r => {
      expect(isRequired(r)).toBe(true);
    });
    optionalFields.forEach(r => {
      expect(isRequired(r)).toBe(false);
    });
  });

  it('should call to create a l3Out', () => {
    const service = TestBed.inject(V2AppCentricL3outsService);
    const createL3OutSpy = jest.spyOn(service, 'createOneL3Out');

    component.modalMode = ModalMode.Create;
    component.form.setValue({
      vrfId: '123',
      name: 'l3out1',
      alias: '',
      description: 'description!',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createL3OutSpy).toHaveBeenCalled();
  });

  it('should call to update an l3Out', () => {
    const service = TestBed.inject(V2AppCentricL3outsService);
    const updateL3OutSpy = jest.spyOn(service, 'updateOneL3Out');

    component.modalMode = ModalMode.Edit;
    component.l3OutId = '123';
    component.form.setValue({
      vrfId: '123',
      name: 'l3Out1',
      alias: '',
      description: 'updated description!',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(updateL3OutSpy).toHaveBeenCalled();
  });

  it('should call ngx.close with the correct argument when cancelled', () => {
    const ngx = component['ngx'];

    const ngxSpy = jest.spyOn(ngx, 'close');

    component['closeModal']();

    expect(ngxSpy).toHaveBeenCalledWith('l3OutsModal');
  });

  it('should reset the form when closing the modal', () => {
    component.form.controls.description.setValue('Test');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(component.form.controls.description.value).toBe('');
  });

  describe('getData', () => {
    const createL3OutDto = () => ({
      ModalMode: ModalMode.Edit,
      l3Out: { id: 1, vrfId: 1 },
    });
    it('should run getData', () => {
      const vrfService = TestBed.inject(V2AppCentricVrfsService);
      const getVrfsSpy = jest.spyOn(vrfService, 'getManyVrf');
      const getOneVrfSpy = jest.spyOn(vrfService, 'getOneVrf');

      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createL3OutDto());

      component.getData();

      expect(getOneVrfSpy).toHaveBeenCalled();
      expect(component.form.controls.description.enabled).toBe(true);
      component.getVrfs();
      expect(getVrfsSpy).toHaveBeenCalled();
    });
  });

  describe('getData branches and value setting', () => {
    it('should enable name in Create mode and not call getVrf when vrfId missing', () => {
      const vrfService = TestBed.inject(V2AppCentricVrfsService);
      const getVrfSpy = jest.spyOn(vrfService, 'getOneVrf');
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => ({ modalMode: ModalMode.Create }));

      component.getData();
      expect(component.form.controls.name.enabled).toBe(true);
      expect(getVrfSpy).not.toHaveBeenCalled();
    });

    it('should set form values and disable name when l3Out provided', () => {
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => ({
        modalMode: ModalMode.Edit,
        l3Out: { id: '1', name: 'L3', description: 'D', alias: 'A', vrfId: 'v1' },
      }));
      jest.spyOn(TestBed.inject(V2AppCentricVrfsService), 'getOneVrf').mockReturnValue({ subscribe: (fn: any) => fn({ id: 'v1' }) } as any);

      component.getData();
      expect(component.form.controls.name.value).toBe('L3');
      expect(component.form.controls.name.disabled).toBe(true);
      expect(component.form.controls.description.value).toBe('D');
      expect(component.form.controls.alias.value).toBe('A');
      expect(component.form.controls.vrfId.value).toBe('v1');
    });
  });

  describe('data loading sequence and error branches', () => {
    it('loadBridgeDomains should log error when no vrfId', () => {
      component['dto'] = { l3Out: {} } as any;
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      (component as any).loadBridgeDomains();
      expect(errSpy).toHaveBeenCalled();
      errSpy.mockRestore();
    });

    it('should load bridge domains, then epgs, then esgs successfully', () => {
      component.tenantId = 't1';
      component['dto'] = { l3Out: { vrfId: 'v1' } } as any;

      jest.spyOn(TestBed.inject(V2AppCentricBridgeDomainsService), 'getManyBridgeDomain').mockReturnValue({
        subscribe: (next: any) =>
          next({
            data: [{ id: 'bd1', name: 'BD1', subnets: [{ id: 's1', name: 'S1', gatewayIp: '1.1.1.1', advertisedExternally: true }] }],
          }),
      } as any);

      jest.spyOn(TestBed.inject(V2AppCentricEndpointGroupsService), 'getManyEndpointGroup').mockReturnValue({
        subscribe: (next: any) => next({ data: [{ id: 'epg1', bridgeDomainId: 'bd1' }] }),
      } as any);

      jest.spyOn(TestBed.inject(V2AppCentricEndpointSecurityGroupsService), 'getManyEndpointSecurityGroup').mockReturnValue({
        subscribe: (next: any) => next({ data: [{ id: 'esg1', selectors: [{ endpointGroupId: 'epg1' }] }] }),
      } as any);

      (component as any).loadBridgeDomains();

      expect(component.bridgeDomains.length).toBe(1);
      expect(component.bridgeDomainsWithSubnets.length).toBe(1);
      const bd = component.bridgeDomainsWithSubnets[0];
      expect(bd.subnets.length).toBe(1);
      expect(bd.epgs.length).toBe(1);
      expect(bd.esgs.length).toBe(1);
    });

    it('should handle error in bridge domains load', () => {
      component.tenantId = 't1';
      component['dto'] = { l3Out: { vrfId: 'v1' } } as any;
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      jest.spyOn(TestBed.inject(V2AppCentricBridgeDomainsService), 'getManyBridgeDomain').mockReturnValue({
        subscribe: (_n: any, error: any) => error(new Error('bd fail')),
      } as any);
      (component as any).loadBridgeDomains();
      expect(errSpy).toHaveBeenCalled();
      errSpy.mockRestore();
    });

    it('should handle error in EPG load', () => {
      component.tenantId = 't1';
      component['dto'] = { l3Out: { vrfId: 'v1' } } as any;
      jest.spyOn(TestBed.inject(V2AppCentricBridgeDomainsService), 'getManyBridgeDomain').mockReturnValue({
        subscribe: (next: any) => next({ data: [{ id: 'bd1', name: 'BD1', subnets: [] }] }),
      } as any);
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      jest.spyOn(TestBed.inject(V2AppCentricEndpointGroupsService), 'getManyEndpointGroup').mockReturnValue({
        subscribe: (_n: any, error: any) => error(new Error('epg fail')),
      } as any);
      (component as any).loadBridgeDomains();
      expect(errSpy).toHaveBeenCalled();
      errSpy.mockRestore();
    });

    it('should handle error in ESG load', () => {
      component.tenantId = 't1';
      component['dto'] = { l3Out: { vrfId: 'v1' } } as any;
      jest.spyOn(TestBed.inject(V2AppCentricBridgeDomainsService), 'getManyBridgeDomain').mockReturnValue({
        subscribe: (next: any) => next({ data: [{ id: 'bd1', name: 'BD1', subnets: [] }] }),
      } as any);
      jest.spyOn(TestBed.inject(V2AppCentricEndpointGroupsService), 'getManyEndpointGroup').mockReturnValue({
        subscribe: (next: any) => next({ data: [] }),
      } as any);
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      jest.spyOn(TestBed.inject(V2AppCentricEndpointSecurityGroupsService), 'getManyEndpointSecurityGroup').mockReturnValue({
        subscribe: (_n: any, error: any) => error(new Error('esg fail')),
      } as any);
      (component as any).loadBridgeDomains();
      expect(errSpy).toHaveBeenCalled();
      errSpy.mockRestore();
    });

    it('processBridgeDomains should no-op when bridgeDomains undefined', () => {
      component['bridgeDomains'] = undefined as any;
      (component as any).processBridgeDomains();
      expect(component.bridgeDomainsWithSubnets).toBeDefined();
    });

    it('updateEpgAssociations should no-op when epgs missing', () => {
      component['epgs'] = undefined as any;
      (component as any).updateEpgAssociations();
    });

    it('updateEsgAssociations should no-op when esgs missing', () => {
      component['esgs'] = undefined as any;
      (component as any).updateEsgAssociations();
    });
  });

  describe('selection toggles and helpers', () => {
    it('toggleSubnetAdvertisement should toggle value', () => {
      component.bridgeDomainsWithSubnets = [
        { id: 'bd1', name: 'BD', subnets: [{ id: 's1', name: 'S', gateway: 'g', isAdvertised: false }], epgs: [], esgs: [] },
      ];
      component.toggleSubnetAdvertisement('bd1', 's1');
      expect(component.bridgeDomainsWithSubnets[0].subnets[0].isAdvertised).toBe(true);
    });

    it('toggleEpgSelection and isEpgSelected should reflect state', () => {
      expect(component.isEpgSelected('e1')).toBe(false);
      component.toggleEpgSelection('e1');
      expect(component.isEpgSelected('e1')).toBe(true);
      component.toggleEpgSelection('e1');
      expect(component.isEpgSelected('e1')).toBe(false);
    });

    it('toggleEsgSelection and isEsgSelected should reflect state', () => {
      expect(component.isEsgSelected('g1')).toBe(false);
      component.toggleEsgSelection('g1');
      expect(component.isEsgSelected('g1')).toBe(true);
      component.toggleEsgSelection('g1');
      expect(component.isEsgSelected('g1')).toBe(false);
    });
  });

  describe('reset, onTableEvent, getVrfs and getVrf', () => {
    it('reset should clear selections and arrays', () => {
      component.selectedEpgIds.add('e1');
      component.selectedEsgIds.add('g1');
      component.bridgeDomainsWithSubnets = [{} as any];
      component.reset();
      expect(component.selectedEpgIds.size).toBe(0);
      expect(component.selectedEsgIds.size).toBe(0);
      expect(component.bridgeDomainsWithSubnets.length).toBe(0);
    });

    it('onTableEvent should set dto and call getVrfs with event', () => {
      const spy = jest.spyOn(component, 'getVrfs');
      const evt = { page: 2, perPage: 50, searchText: 'abc', searchColumn: 'name' } as any;
      component.onTableEvent(evt);
      expect(component.tableComponentDto).toBe(evt);
      expect(spy).toHaveBeenCalledWith(evt);
    });

    it('getVrfs should build search filter, set pagination, and unset loading on complete', () => {
      const vrfService = TestBed.inject(V2AppCentricVrfsService);
      const spy = jest.spyOn(vrfService, 'getManyVrf').mockReturnValue({
        subscribe: (next: any, _err: any, complete: any) => {
          next({ data: [] });
          complete();
        },
      } as any);
      component.tenantId = 't1';
      component.getVrfs({ page: 3, perPage: 10, searchText: 'foo', searchColumn: 'name' });
      expect(spy).toHaveBeenCalled();
      const args = spy.mock.calls[0][0] as any;
      expect(args.filter).toEqual(expect.arrayContaining([`tenantId||eq||t1`, `name||cont||foo`]));
      expect(component.isLoading).toBe(false);
    });

    it('getVrfs should set vrfs null on error and unset loading', () => {
      const vrfService = TestBed.inject(V2AppCentricVrfsService);
      jest.spyOn(vrfService, 'getManyVrf').mockReturnValue({
        subscribe: (_n: any, error: any, complete: any) => {
          error(new Error('fail'));
          complete();
        },
      } as any);
      component.tenantId = 't1';
      component.getVrfs();
      expect(component.vrfs).toBeNull();
      expect(component.isLoading).toBe(false);
    });

    it('getVrf should set vrf', () => {
      const vrfService = TestBed.inject(V2AppCentricVrfsService);
      jest.spyOn(vrfService, 'getOneVrf').mockReturnValue({ subscribe: (next: any) => next({ id: 'v1' }) } as any);
      component.getVrf('v1');
      expect(component.vrf).toEqual({ id: 'v1' } as any);
    });
  });
});
