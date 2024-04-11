import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockNgxSmartModalComponent,
  MockFontAwesomeComponent,
  MockComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { BridgeDomainModalComponent } from './bridge-domain-modal.component';
import { V2AppCentricBridgeDomainsService } from 'client';
describe('BridgeDomainModalComponent', () => {
  let component: BridgeDomainModalComponent;
  let fixture: ComponentFixture<BridgeDomainModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        BridgeDomainModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockIconButtonComponent,
        MockImportExportComponent,
      ],
      imports: [NgSelectModule, FormsModule, ReactiveFormsModule, RouterTestingModule, HttpClientModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V2AppCentricBridgeDomainsService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeDomainModalComponent);
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
    const optionalFields = [
      'alias',
      'description',
      'unicastRouting',
      'arpFlooding',
      'bdMacAddress',
      'limitLocalIpLearning',
      'epMoveDetectionModeGarp',
    ];

    requiredFields.forEach(r => {
      expect(isRequired(r)).toBe(true);
    });
    optionalFields.forEach(r => {
      expect(isRequired(r)).toBe(false);
    });
  });

  describe('bdMacAddress', () => {
    it('should have a valid mac address', () => {
      const { bdMacAddress } = component.form.controls;

      bdMacAddress.setValue('00:0a:95:9d:68:16');
      expect(bdMacAddress.valid).toBe(true);

      bdMacAddress.setValue('ma:ca:dd:re:ss');
      expect(bdMacAddress.valid).toBe(false);
    });
  });

  describe('routeProfile', () => {
    it('should be required when l3OutForRouteProfileId is set', () => {
      const { l3OutForRouteProfileId, routeProfileId } = component.form.controls;

      l3OutForRouteProfileId.setValue('123');
      expect(l3OutForRouteProfileId.valid).toBe(true);
      expect(routeProfileId.valid).toBe(false);

      routeProfileId.setValue('123');
      expect(routeProfileId.valid).toBe(true);
    });
  });

  // describe('importConsumedContractsEpgRelationonfig', () => {
  //   const mockNgxSmartModalComponent = {
  //     getData: jest.fn().mockReturnValue({ modalYes: true }),
  //     removeData: jest.fn(),
  //     onCloseFinished: {
  //       subscribe: jest.fn(),
  //     },
  //   };

  //   beforeEach(() => {
  //     component['ngx'] = {
  //       getModal: jest.fn().mockReturnValue({
  //         ...mockNgxSmartModalComponent,
  //         open: jest.fn(),
  //       }),
  //       setModalData: jest.fn(),
  //     } as any;
  //   });

  //   it('should display a confirmation modal with the correct message', () => {
  //     const event = [{ name: 'L3Out 1' }, { name: 'L3Out 2' }] as any;
  //     const modalDto = new YesNoModalDto(
  //       'Import L3 Outs',
  //       `Are you sure you would like to import ${event.length} L3 Outs?`,
  //     );
  //     const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

  //     component.importBridgeDomainL3OutRelation(event);

  //     expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
  //   });

  //   it('should import L3Outs and refresh on confirmation', () => {
  //     const event = [{ name: 'L3Out 1' }, { name: 'L3Out 2' }] as any;
  //     jest.spyOn(component, 'getL3OutsTableData');
  //     jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
  //       onConfirm();

  //       expect(component['bridgeDomainService'].addL3OutToBridgeDomainBridgeDomain).toHaveBeenCalledTimes(2);

  //       mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
  //         const data = modal.getData() as YesNoModalDto;
  //         modal.removeData();
  //         if (data && data.modalYes) {
  //           onConfirm();
  //         }
  //       });

  //       return new Subscription();
  //     });

  //     component.importBridgeDomainL3OutRelation(event);

  //     expect(component.getL3OutsTableData).toHaveBeenCalled();
  //   });
  // });
});
