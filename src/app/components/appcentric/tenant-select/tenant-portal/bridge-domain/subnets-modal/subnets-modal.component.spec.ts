/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockNgxSmartModalComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { SubnetsModalComponent } from './subnets-modal.component';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { of, Subscription } from 'rxjs';
import { AppCentricSubnet, Subnet, V2AppCentricAppCentricSubnetsService } from 'client';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';

describe('SubnetsModalComponent', () => {
  let component: SubnetsModalComponent;
  let fixture: ComponentFixture<SubnetsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        SubnetsModalComponent,
        MockNgxSmartModalComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockComponent({ selector: 'app-subnets-edit-modal', inputs: ['bridgeDomainId', 'tenantId'] }),
        MockYesNoModalComponent,
      ],
      imports: [RouterTestingModule, HttpClientModule, ReactiveFormsModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V2AppCentricAppCentricSubnetsService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubnetsModalComponent);
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
    const requiredFields = ['name', 'gatewayIp', 'primaryIpAddress'];
    const optionalFields = [
      'alias',
      'description',
      'treatAsVirtualIpAddress',
      'advertisedExternally',
      'preferred',
      'sharedBetweenVrfs',
      'ipDataPlaneLearning',
    ];

    requiredFields.forEach(r => {
      expect(isRequired(r)).toBe(true);
    });
    optionalFields.forEach(r => {
      expect(isRequired(r)).toBe(false);
    });
  });

  describe('gatewayIp', () => {
    it('should have proper IP CIDR notation', () => {
      const { gatewayIp } = component.form.controls;

      gatewayIp.setValue('192.168.1.0/24');
      expect(gatewayIp.valid).toBe(true);

      gatewayIp.setValue('192.168.1.0/abc');
      expect(gatewayIp.valid).toBe(false);

      gatewayIp.setValue('2001:0db8:85a3:0000:0000:8a2e:0370:7334/64');
      expect(gatewayIp.valid).toBe(true);

      gatewayIp.setValue('2001:0db8:85a3:0000:0000:8a2e:0370:7334/xyz');
      expect(gatewayIp.valid).toBe(false);
    });
  });

  describe('importAppCentricSubnetsConfig', () => {
    const mockNgxSmartModalComponent = {
      getData: jest.fn().mockReturnValue({ modalYes: true }),
      removeData: jest.fn(),
      onCloseFinished: {
        subscribe: jest.fn(),
      },
    };

    beforeEach(() => {
      component['ngx'] = {
        getModal: jest.fn().mockReturnValue({
          ...mockNgxSmartModalComponent,
          open: jest.fn(),
        }),
        setModalData: jest.fn(),
      } as any;
    });

    it('should display a confirmation modal with the correct message', () => {
      const event = [{ name: 'Subnet 1' }, { name: 'Subnet 1' }] as any;
      const modalDto = new YesNoModalDto('Import Subnets', `Are you sure you would like to import ${event.length} Subnets?`);
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importSubnets(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import subnets and refresh the table on confirmation', () => {
      const event = [{ name: 'Subnet 1' }, { name: 'Subnet 1' }] as any;
      jest.spyOn(component, 'getSubnets');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['subnetsService'].createManyAppCentricSubnet).toHaveBeenCalledWith({
          createManyAppCentricSubnetDto: { bulk: component.sanitizeData(event) },
        });

        mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
          const data = modal.getData() as YesNoModalDto;
          modal.removeData();
          if (data && data.modalYes) {
            onConfirm();
          }
        });

        return new Subscription();
      });

      component.importSubnets(event);

      expect(component.getSubnets).toHaveBeenCalled();
    });
  });

  it('should call ngx.close with the correct argument when cancelled', () => {
    const ngx = component['ngx'];

    const ngxSpy = jest.spyOn(ngx, 'close');

    component['closeModal']();

    expect(ngxSpy).toHaveBeenCalledWith('subnetsModal');
  });

  describe('getData', () => {
    const createSubnetDto = () => ({
      ModalMode: ModalMode.Edit,
      bridgeDomain: { id: 1 },
    });
    it('should run getData', () => {
      jest.spyOn(component, 'getSubnets');
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createSubnetDto());

      component.getData();

      expect(component.form.controls.description.enabled).toBe(true);
      expect(component.getSubnets).toHaveBeenCalled();
    });
  });

  it('should delete subnet', () => {
    const subnetToDelete = { id: '123', description: 'Bye!' } as AppCentricSubnet;
    const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
    component.removeSubnet(subnetToDelete);
    const getSubnetsMock = jest.spyOn(component['subnetsService'], 'getManyAppCentricSubnet');
    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(getSubnetsMock).toHaveBeenCalled();
  });

  it('should restore subnet', () => {
    const subnet = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['subnetsService'], 'restoreOneAppCentricSubnet').mockReturnValue(of({} as any));
    jest.spyOn(component, 'getSubnets');
    component.restoreSubnet(subnet);
    expect(component['subnetsService'].restoreOneAppCentricSubnet).toHaveBeenCalledWith({ id: subnet.id });
    expect(component.getSubnets).toHaveBeenCalled();
  });

  it('should apply search params when filtered results is true', () => {
    const subnet = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['subnetsService'], 'restoreOneAppCentricSubnet').mockReturnValue(of({} as any));

    const getSubnetsSpy = jest.spyOn(component, 'getSubnets');
    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

    component.restoreSubnet(subnet);

    expect(getSubnetsSpy).toHaveBeenCalledWith(params);
  });
});
