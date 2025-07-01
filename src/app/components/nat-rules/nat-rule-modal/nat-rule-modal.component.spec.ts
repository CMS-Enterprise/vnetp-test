import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  MockFontAwesomeComponent,
  MockNgSelectComponent,
  MockNgxSmartModalComponent,
  MockTooltipComponent,
} from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NatRuleModalComponent } from './nat-rule-modal.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from '../../../../test/mock-providers';
import {
  NatRule,
  NatRuleDirectionEnum,
  NatRuleGroupTypeEnum,
  NatRuleOriginalDestinationAddressTypeEnum,
  NatRuleOriginalServiceTypeEnum,
  NatRuleOriginalSourceAddressTypeEnum,
  NatRuleTranslatedDestinationAddressTypeEnum,
  NatRuleTranslatedServiceTypeEnum,
  NatRuleTranslatedSourceAddressTypeEnum,
  NatRuleTranslationTypeEnum,
  V1NetworkSecurityNatRulesService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
} from 'client';
import { NatRuleObjectInfoModalComponent } from './nat-rule-object-info-modal/nat-rule-object-info-modal.component';
import { ModalMode } from '../../../models/other/modal-mode';
import { ActivatedRoute } from '@angular/router';
import { ApplicationMode } from '../../../models/other/application-mode-enum';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

describe('NatRuleModalComponent', () => {
  let component: NatRuleModalComponent;
  let fixture: ComponentFixture<NatRuleModalComponent>;
  let ngxSmartModalService: NgxSmartModalService;
  let natRuleService: V1NetworkSecurityNatRulesService;

  const mockNatRule: NatRule = {
    id: 'nat-rule-1',
    name: 'test-rule',
    ruleIndex: 1,
    enabled: true,
    direction: NatRuleDirectionEnum.In,
    fromZone: [],
    toZoneId: '',
    originalSourceAddressType: NatRuleOriginalSourceAddressTypeEnum.None,
    originalDestinationAddressType: NatRuleOriginalDestinationAddressTypeEnum.None,
    originalServiceType: NatRuleOriginalServiceTypeEnum.None,
    translatedSourceAddressType: NatRuleTranslatedSourceAddressTypeEnum.None,
    translatedDestinationAddressType: NatRuleTranslatedDestinationAddressTypeEnum.None,
    translatedServiceType: NatRuleTranslatedServiceTypeEnum.None,
    translationType: NatRuleTranslationTypeEnum.Static,
    biDirectional: false,
    natRuleGroupId: 'group-1',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([]), HttpClientTestingModule],
      declarations: [
        NatRuleModalComponent,
        MockTooltipComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockNgSelectComponent,
        NatRuleObjectInfoModalComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1NetworkSecurityNatRulesService),
        MockProvider(V1NetworkSecurityNetworkObjectsService),
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1NetworkSecurityServiceObjectsService),
        MockProvider(V1NetworkSecurityServiceObjectGroupsService),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                mode: ApplicationMode.NETCENTRIC,
              },
            },
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NatRuleModalComponent);
    component = fixture.componentInstance;
    ngxSmartModalService = TestBed.inject(NgxSmartModalService);
    natRuleService = TestBed.inject(V1NetworkSecurityNatRulesService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initNatRule', () => {
    it('should initialize for Edit mode', () => {
      const dto = {
        modalMode: ModalMode.Edit,
        GroupType: NatRuleGroupTypeEnum.Intervrf,
        natRule: mockNatRule,
      };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto);

      component.initNatRule();

      expect(component.modalMode).toBe(ModalMode.Edit);
      expect(component.natRuleId).toBe(mockNatRule.id);
      expect(component.form.value.name).toBe(mockNatRule.name);
    });

    it('should initialize for Create mode', () => {
      const dto = {
        modalMode: ModalMode.Create,
        GroupType: NatRuleGroupTypeEnum.Intervrf,
        natRule: {},
        natRuleGroupId: 'group-1',
      };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto as any);

      component.initNatRule();

      expect(component.modalMode).toBe(ModalMode.Create);
      expect(component.natRuleId).toBeUndefined();
      expect(component.natRuleGroupId).toBe('group-1');
    });

    it('should handle ZoneBased group type', () => {
      const dto = {
        modalMode: ModalMode.Edit,
        GroupType: NatRuleGroupTypeEnum.ZoneBased,
        natRule: { ...mockNatRule, fromZone: [{ id: 'z1' }], toZoneId: 'z2' },
        Zones: [{ id: 'z1' }, { id: 'z2' }],
      };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto as any);
      component.initNatRule();

      expect(component.NatRuleGroupType).toBe(NatRuleGroupTypeEnum.ZoneBased);
      expect(component.zones).toEqual(dto.Zones);
      expect(component.selectedFromZones).toEqual(dto.natRule.fromZone);
      expect(component.form.controls.toZone.value).toBe('z2');
      expect(component.form.controls.direction.validator).toBeNull();
      expect(component.form.controls.toZone.validator).toBeDefined();
    });

    it('should handle InterVRF group type', () => {
      const dto = {
        modalMode: ModalMode.Edit,
        GroupType: NatRuleGroupTypeEnum.Intervrf,
        natRule: mockNatRule,
      };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto);
      component.initNatRule();

      expect(component.NatRuleGroupType).toBe(NatRuleGroupTypeEnum.Intervrf);
      expect(component.form.controls.direction.validator).toBeDefined();
      expect(component.form.controls.toZone.validator).toBeNull();
    });

    it('should handle fromZone being null', () => {
      const dto = {
        modalMode: ModalMode.Edit,
        GroupType: NatRuleGroupTypeEnum.ZoneBased,
        natRule: { ...mockNatRule, fromZone: null, toZoneId: 'z2' },
        Zones: [{ id: 'z1' }, { id: 'z2' }],
      };
      jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(dto as any);
      component.initNatRule();
      expect(component.selectedFromZones).toEqual([]);
    });
  });

  describe('save', () => {
    beforeEach(() => {
      // Set valid default values
      component.form.controls.name.setValue('valid-name');
      component.form.controls.ruleIndex.setValue(1);
    });

    it('should not save if form is invalid', () => {
      component.form.controls.name.setValue(''); // Invalid name
      const createSpy = jest.spyOn(natRuleService, 'createOneNatRule');
      component.save();
      expect(component.submitted).toBe(true);
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('should set ruleIndex to null if it is NaN', () => {
      component.form.controls.ruleIndex.setValue(NaN as any);
      component.save();
      expect(component.form.controls.ruleIndex.value).toBeNull();
    });

    it('should call createOneNatRule in Create mode', fakeAsync(() => {
      component.modalMode = ModalMode.Create;
      component.natRuleGroupId = 'group-1';
      const createSpy = jest
        .spyOn(natRuleService, 'createOneNatRule')
        .mockReturnValue(of(new HttpResponse<NatRule>({ body: mockNatRule })));
      const closeSpy = jest.spyOn(component, 'closeModal');

      component.save();
      tick();

      expect(createSpy).toHaveBeenCalled();
      const createdRule = createSpy.mock.calls[0][0].natRule;
      expect(createdRule.natRuleGroupId).toBe('group-1');
      expect(closeSpy).toHaveBeenCalled();
    }));

    it('should call updateOneNatRule in Edit mode', fakeAsync(() => {
      component.modalMode = ModalMode.Edit;
      component.natRuleId = 'rule-1';
      const updateSpy = jest
        .spyOn(natRuleService, 'updateOneNatRule')
        .mockReturnValue(of(new HttpResponse<NatRule>({ body: mockNatRule })));
      const closeSpy = jest.spyOn(component, 'closeModal');

      component.save();
      tick();

      expect(updateSpy).toHaveBeenCalledWith({ id: 'rule-1', natRule: expect.any(Object) });
      expect(closeSpy).toHaveBeenCalled();
    }));

    describe('save branch coverage', () => {
      const testSaveMapping = (setup: () => void, expected: Partial<NatRule>) => {
        component.modalMode = ModalMode.Create;
        const createSpy = jest
          .spyOn(natRuleService, 'createOneNatRule')
          .mockReturnValue(of(new HttpResponse<NatRule>({ body: mockNatRule })));
        setup();
        component.save();
        const rulePayload = createSpy.mock.calls[0][0].natRule;
        expect(rulePayload).toMatchObject(expected);
      };

      it('should map original source NetworkObject', () => {
        testSaveMapping(
          () => {
            component.form.controls.originalSourceAddressType.setValue(NatRuleOriginalSourceAddressTypeEnum.NetworkObject);
            component.form.controls.originalSourceNetworkObject.setValue('no-1');
          },
          { originalSourceNetworkObjectId: 'no-1' },
        );
      });

      it('should map original source NetworkObjectGroup', () => {
        testSaveMapping(
          () => {
            component.form.controls.originalSourceAddressType.setValue(NatRuleOriginalSourceAddressTypeEnum.NetworkObjectGroup);
            component.form.controls.originalSourceNetworkObjectGroup.setValue('nog-1');
          },
          { originalSourceNetworkObjectGroupId: 'nog-1' },
        );
      });

      it('should map original destination NetworkObject', () => {
        testSaveMapping(
          () => {
            component.form.controls.originalDestinationAddressType.setValue(NatRuleOriginalDestinationAddressTypeEnum.NetworkObject);
            component.form.controls.originalDestinationNetworkObject.setValue('no-2');
          },
          { originalDestinationNetworkObjectId: 'no-2' },
        );
      });

      it('should map original destination NetworkObjectGroup', () => {
        testSaveMapping(
          () => {
            component.form.controls.originalDestinationAddressType.setValue(NatRuleOriginalDestinationAddressTypeEnum.NetworkObjectGroup);
            component.form.controls.originalDestinationNetworkObjectGroup.setValue('nog-2');
          },
          { originalDestinationNetworkObjectGroupId: 'nog-2' },
        );
      });

      it('should map original service ServiceObject', () => {
        testSaveMapping(
          () => {
            component.form.controls.originalServiceType.setValue(NatRuleOriginalServiceTypeEnum.ServiceObject);
            component.form.controls.originalServiceObject.setValue('so-1');
          },
          { originalServiceObjectId: 'so-1' },
        );
      });

      it('should map translated source NetworkObject', () => {
        testSaveMapping(
          () => {
            component.form.controls.originalSourceAddressType.setValue(NatRuleOriginalSourceAddressTypeEnum.NetworkObject);
            component.form.controls.originalSourceNetworkObject.setValue('no-1');
            component.form.controls.translatedSourceAddressType.setValue(NatRuleTranslatedSourceAddressTypeEnum.NetworkObject);
            component.form.controls.translatedSourceNetworkObject.setValue('t-no-1');
          },
          { translatedSourceNetworkObjectId: 't-no-1' },
        );
      });

      it('should map translated source NetworkObjectGroup', () => {
        testSaveMapping(
          () => {
            component.form.controls.originalSourceAddressType.setValue(NatRuleOriginalSourceAddressTypeEnum.NetworkObject);
            component.form.controls.originalSourceNetworkObject.setValue('no-1');
            component.form.controls.translatedSourceAddressType.setValue(NatRuleTranslatedSourceAddressTypeEnum.NetworkObjectGroup);
            component.form.controls.translatedSourceNetworkObjectGroup.setValue('t-nog-1');
          },
          { translatedSourceNetworkObjectGroupId: 't-nog-1' },
        );
      });

      it('should map translated destination NetworkObject', () => {
        testSaveMapping(
          () => {
            component.form.controls.originalDestinationAddressType.setValue(NatRuleOriginalDestinationAddressTypeEnum.NetworkObject);
            component.form.controls.originalDestinationNetworkObject.setValue('no-2');
            component.form.controls.translatedDestinationAddressType.setValue(NatRuleTranslatedDestinationAddressTypeEnum.NetworkObject);
            component.form.controls.translatedDestinationNetworkObject.setValue('t-no-2');
          },
          { translatedDestinationNetworkObjectId: 't-no-2' },
        );
      });

      it('should map translated destination NetworkObjectGroup', () => {
        testSaveMapping(
          () => {
            component.form.controls.originalDestinationAddressType.setValue(NatRuleOriginalDestinationAddressTypeEnum.NetworkObjectGroup);
            component.form.controls.originalDestinationNetworkObjectGroup.setValue('nog-2');
            component.form.controls.translatedDestinationAddressType.setValue(
              NatRuleTranslatedDestinationAddressTypeEnum.NetworkObjectGroup,
            );
            component.form.controls.translatedDestinationNetworkObjectGroup.setValue('t-nog-2');
          },
          { translatedDestinationNetworkObjectGroupId: 't-nog-2' },
        );
      });

      it('should map translated service ServiceObject', () => {
        testSaveMapping(
          () => {
            component.form.controls.originalServiceType.setValue(NatRuleOriginalServiceTypeEnum.ServiceObject);
            component.form.controls.originalServiceObject.setValue('so-1');
            component.form.controls.translatedServiceType.setValue(NatRuleTranslatedServiceTypeEnum.ServiceObject);
            component.form.controls.translatedServiceObject.setValue('t-so-1');
          },
          { translatedServiceObjectId: 't-so-1' },
        );
      });

      it('should map zones for ZoneBased group type', () => {
        testSaveMapping(
          () => {
            component.NatRuleGroupType = NatRuleGroupTypeEnum.ZoneBased;
            component.selectedFromZones = [{ id: 'z1', name: 'z1', tierId: 't1' }];
            component.form.controls.toZone.setValue('z2');
          },
          { fromZone: [{ id: 'z1', name: 'z1', tierId: 't1' }], toZoneId: 'z2', direction: null },
        );
      });

      it('should map direction for non-ZoneBased group type', () => {
        testSaveMapping(
          () => {
            component.NatRuleGroupType = NatRuleGroupTypeEnum.Intervrf;
            component.form.controls.direction.setValue(NatRuleDirectionEnum.Out);
          },
          { fromZone: null, toZoneId: null, direction: NatRuleDirectionEnum.Out },
        );
      });
    });
  });

  describe('closeModal', () => {
    it('should close the modal', () => {
      const closeSpy = jest.spyOn(ngxSmartModalService, 'close');
      component.closeModal();
      expect(closeSpy).toHaveBeenCalledWith('natRuleModal');
    });
  });

  describe('reset', () => {
    it('should reset the form and component properties', () => {
      const resetModalDataSpy = jest.spyOn(ngxSmartModalService, 'resetModalData');
      const initFormSpy = jest.spyOn(component as any, 'initForm');

      component.submitted = true;
      component.selectedFromZones = [{ id: 'z1' } as any];
      component.reset();

      expect(component.submitted).toBe(false);
      expect(component.selectedFromZones).toEqual([]);
      expect(resetModalDataSpy).toHaveBeenCalledWith('natRuleModal');
      expect(initFormSpy).toHaveBeenCalled();
    });
  });

  describe('Form Subscriptions', () => {
    it('should set translationType to Static when biDirectional is true', () => {
      component.form.controls.biDirectional.setValue(true);
      expect(component.form.value.translationType).toBe(NatRuleTranslationTypeEnum.Static);
    });

    describe('subscribeToTranslationTypeChanges', () => {
      it('should require translated fields for Static type', () => {
        component.form.controls.translationType.setValue(NatRuleTranslationTypeEnum.Static);
        expect(component.form.controls.translatedSourceAddressType.validator).not.toBeNull();
        expect(component.form.controls.translatedDestinationAddressType.validator).not.toBeNull();
      });

      it('should handle DynamicIp type', () => {
        component.form.controls.biDirectional.setValue(true); // to be set to false by the subscription
        component.form.controls.translationType.setValue(NatRuleTranslationTypeEnum.DynamicIp);
        expect(component.form.value.biDirectional).toBe(false);
        expect(component.form.value.originalSourceAddressType).toBe(NatRuleOriginalSourceAddressTypeEnum.NetworkObject);
        expect(component.form.value.translatedSourceAddressType).toBe(NatRuleTranslatedSourceAddressTypeEnum.NetworkObject);
      });

      it('should handle DynamicIpAndPort type', () => {
        component.form.controls.translationType.setValue(NatRuleTranslationTypeEnum.DynamicIpAndPort);
        expect(component.form.value.biDirectional).toBe(false);
      });

      it('should handle Nat64 type', () => {
        component.form.controls.originalServiceType.enable();
        component.form.controls.translationType.setValue(NatRuleTranslationTypeEnum.Nat64);
        expect(component.form.controls.originalServiceType.disabled).toBe(true);
        expect(component.form.controls.translatedServiceType.disabled).toBe(true);
        expect(component.form.controls.translatedDestinationAddressType.disabled).toBe(true);
        expect(component.form.value.originalSourceAddressType).toBe(NatRuleOriginalSourceAddressTypeEnum.NetworkObject);
        expect(component.form.value.translatedSourceAddressType).toBe(NatRuleTranslatedSourceAddressTypeEnum.NetworkObject);
        expect(component.form.value.originalDestinationAddressType).toBe(NatRuleOriginalDestinationAddressTypeEnum.NetworkObject);
      });
    });
  });

  describe('getObjectInfo', () => {
    let networkObjectService: V1NetworkSecurityNetworkObjectsService;
    let networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService;
    let serviceObjectService: V1NetworkSecurityServiceObjectsService;
    let setModalDataSpy: jest.SpyInstance;
    let openModalSpy: jest.SpyInstance;

    beforeEach(() => {
      networkObjectService = TestBed.inject(V1NetworkSecurityNetworkObjectsService);
      networkObjectGroupService = TestBed.inject(V1NetworkSecurityNetworkObjectGroupsService);
      serviceObjectService = TestBed.inject(V1NetworkSecurityServiceObjectsService);

      const mockModal = {
        open: jest.fn(),
        onCloseFinished: of({}),
      };
      openModalSpy = jest.spyOn(mockModal, 'open');
      setModalDataSpy = jest.spyOn(ngxSmartModalService, 'setModalData');
      jest.spyOn(ngxSmartModalService, 'getModal').mockReturnValue(mockModal as any);
    });

    it('should not open modal if objectId is falsy', () => {
      component.getObjectInfo('prop', 'NetworkObject', null);
      expect(openModalSpy).not.toHaveBeenCalled();
    });

    describe('with NetworkObject', () => {
      it('should handle FQDN type', () => {
        const mockData = { name: 'test-fqdn', type: 'Fqdn', fqdn: 'a.com' };
        jest.spyOn(networkObjectService, 'getOneNetworkObject').mockReturnValue(of(mockData as any));
        component.getObjectInfo('MyProp', 'NetworkObject', 'id1');
        expect(networkObjectService.getOneNetworkObject).toHaveBeenCalledWith({ id: 'id1' });
        expect(setModalDataSpy).toHaveBeenCalledWith(
          { modalTitle: 'MyProp : test-fqdn', modalBody: ['Fqdn: a.com'] },
          'natRuleObjectInfoModal',
        );
        expect(openModalSpy).toHaveBeenCalled();
      });

      it('should handle Range type', () => {
        const mockData = { name: 'test-range', type: 'Range', startIpAddress: '1.1.1.1', endIpAddress: '2.2.2.2' };
        jest.spyOn(networkObjectService, 'getOneNetworkObject').mockReturnValue(of(mockData as any));
        component.getObjectInfo('MyProp', 'NetworkObject', 'id1');
        expect(setModalDataSpy).toHaveBeenCalledWith(
          { modalTitle: 'MyProp : test-range', modalBody: ['Range: 1.1.1.1 - 2.2.2.2'] },
          'natRuleObjectInfoModal',
        );
      });

      it('should handle IpAddress type', () => {
        const mockData = { name: 'test-ip', type: 'IpAddress', ipAddress: '3.3.3.3' };
        jest.spyOn(networkObjectService, 'getOneNetworkObject').mockReturnValue(of(mockData as any));
        component.getObjectInfo('MyProp', 'NetworkObject', 'id1');
        expect(setModalDataSpy).toHaveBeenCalledWith(
          { modalTitle: 'MyProp : test-ip', modalBody: ['IpAddress: 3.3.3.3'] },
          'natRuleObjectInfoModal',
        );
      });
    });

    describe('with NetworkObjectGroup', () => {
      it('should handle various member types', () => {
        const mockData = {
          name: 'test-group',
          networkObjects: [
            { name: 'mem1', type: 'IpAddress', ipAddress: '1.1.1.1' },
            { name: 'mem2', type: 'Range', startIpAddress: '2.2.2.2', endIpAddress: '3.3.3.3' },
            { name: 'mem3', type: 'Fqdn', fqdn: 'b.com' },
          ],
        };
        jest.spyOn(networkObjectGroupService, 'getOneNetworkObjectGroup').mockReturnValue(of(mockData as any));
        component.getObjectInfo('MyProp', 'NetworkObjectGroup', 'id1');
        expect(networkObjectGroupService.getOneNetworkObjectGroup).toHaveBeenCalledWith({ id: 'id1', join: ['networkObjects'] });
        expect(setModalDataSpy).toHaveBeenCalledWith(
          {
            modalTitle: 'MyProp : test-group',
            modalBody: ['Name: mem1 --- IP Address: 1.1.1.1', 'Name: mem2 --- Range: 2.2.2.2-3.3.3.3', 'Name: mem3 --- FQDN: b.com'],
          },
          'natRuleObjectInfoModal',
        );
        expect(openModalSpy).toHaveBeenCalled();
      });
    });

    describe('with ServiceObject', () => {
      it('should open modal with service object info', () => {
        const mockData = { name: 'test-svc', protocol: 'TCP', sourcePorts: 'any', destinationPorts: '80,443' };
        jest.spyOn(serviceObjectService, 'getOneServiceObject').mockReturnValue(of(mockData as any));
        component.getObjectInfo('MyProp', 'ServiceObject', 'id1');
        expect(serviceObjectService.getOneServiceObject).toHaveBeenCalledWith({ id: 'id1' });
        expect(setModalDataSpy).toHaveBeenCalledWith(
          {
            modalTitle: 'MyProp : test-svc',
            modalBody: ['Protocol : TCP, Source Ports: any, Destination Ports: 80,443'],
          },
          'natRuleObjectInfoModal',
        );
        expect(openModalSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Zone Management', () => {
    beforeEach(() => {
      component.zones = [
        { id: 'z1', name: 'Zone 1', tierId: 't1' },
        { id: 'z2', name: 'Zone 2', tierId: 't1' },
        { id: 'z3', name: 'Zone 3', tierId: 't1' },
      ];
      component.selectedFromZones = [];
    });

    describe('addZone', () => {
      it('should add a selected zone to selectedFromZones', () => {
        component.form.controls.selectedFromZone.setValue('z1');
        component.addZone();
        expect(component.selectedFromZones).toHaveLength(1);
        expect(component.selectedFromZones[0].id).toBe('z1');
        expect(component.form.controls.selectedFromZone.value).toBeNull();
      });

      it('should not add a zone if it is already selected', () => {
        component.selectedFromZones = [{ id: 'z1', name: 'Zone 1', tierId: 't1' }];
        component.form.controls.selectedFromZone.setValue('z1');
        component.addZone();
        expect(component.selectedFromZones).toHaveLength(1);
      });
    });

    describe('removeZone', () => {
      it('should remove a zone from selectedFromZones by id', () => {
        component.selectedFromZones = [
          { id: 'z1', name: 'Zone 1', tierId: 't1' },
          { id: 'z2', name: 'Zone 2', tierId: 't1' },
        ];
        component.removeZone('z1');
        expect(component.selectedFromZones).toHaveLength(1);
        expect(component.selectedFromZones[0].id).toBe('z2');
      });
    });
  });
});
