import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { of, Subject, throwError } from 'rxjs';
import {
  V2AppCentricEndpointSecurityGroupsService,
  V2AppCentricVrfsService,
  V2AppCentricApplicationProfilesService,
  V2AppCentricSelectorsService,
  V2AppCentricEndpointGroupsService,
  EndpointGroup,
  EndpointSecurityGroup,
  Vrf,
  ApplicationProfile,
  EndpointSecurityGroupAdminStateEnum,
  SelectorSelectorTypeEnum,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { EntityService } from 'src/app/services/entity.service';
import { EndpointSecurityGroupModalComponent } from './endpoint-security-group-modal.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { SelectorModalDto } from 'src/app/models/appcentric/appcentric-selector-modal-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import ObjectUtil from 'src/app/utils/ObjectUtil';

jest.mock('src/app/utils/SubscriptionUtil');
jest.mock('src/app/utils/ObjectUtil');

const MOCK_EPG: EndpointGroup = {
  id: 'epg-1',
  name: 'epg1',
  tenantId: 'tenant-1',
  intraEpgIsolation: false,
  bridgeDomainId: 'bd-1',
  applicationProfileId: 'ap-1',
};

const MOCK_VRF: Vrf = {
  id: 'vrf-1',
  name: 'vrf1',
  tenantId: 'tenant-1',
  policyControlEnforced: false,
  policyControlEnforcementIngress: false,
};
const MOCK_AP: ApplicationProfile = { id: 'ap-1', name: 'ap1', tenantId: 'tenant-1' };

const MOCK_ESG: EndpointSecurityGroup = {
  id: 'esg-1',
  name: 'test-esg',
  description: 'test-desc',
  tenantId: 'tenant-1',
  preferredGroupMember: true,
  adminState: EndpointSecurityGroupAdminStateEnum.AdminUp,
  intraEsgIsolation: false,
  applicationProfileId: 'ap-1',
  vrfId: 'vrf-1',
};

describe('EndpointSecurityGroupModalComponent', () => {
  let component: EndpointSecurityGroupModalComponent;
  let fixture: ComponentFixture<EndpointSecurityGroupModalComponent>;

  let mockNgxSmartModalService;
  let mockEndpointSecurityGroupService;
  let mockVrfService;
  let mockApplicationProfileService;
  let mockSelectorService;
  let mockEndpointGroupService;
  let mockEntityService;
  let mockModal;
  let mockModalOnCloseFinished: Subject<void>;
  let mockYesNoModal;
  let mockYesNoModalOnCloseFinished: Subject<any>;

  beforeEach(async () => {
    mockModalOnCloseFinished = new Subject<void>();
    mockModal = {
      onCloseFinished: mockModalOnCloseFinished.asObservable(),
      open: jest.fn(),
      close: jest.fn(),
    };

    mockYesNoModalOnCloseFinished = new Subject<any>();
    mockYesNoModal = {
      onCloseFinished: mockYesNoModalOnCloseFinished.asObservable(),
      open: jest.fn(),
      getData: jest.fn(),
    };

    mockNgxSmartModalService = {
      getModal: jest.fn().mockImplementation(id => {
        if (id === 'selectorModal') {
          return mockModal;
        }
        if (id === 'yesNoModal') {
          return mockYesNoModal;
        }
        return { open: jest.fn(), close: jest.fn(), onClose: of(null), onCloseFinished: of(null) };
      }),
      setModalData: jest.fn(),
      resetModalData: jest.fn(),
      close: jest.fn(),
      getModalData: jest.fn().mockReturnValue({ modalMode: ModalMode.Create, endpointSecurityGroup: {} }),
    };

    mockEndpointSecurityGroupService = {
      getOneEndpointSecurityGroup: jest.fn().mockReturnValue(of({ selectors: [] })),
      createOneEndpointSecurityGroup: jest.fn().mockReturnValue(of(MOCK_ESG)),
      updateOneEndpointSecurityGroup: jest.fn().mockReturnValue(of(MOCK_ESG)),
    };

    mockVrfService = {
      getManyVrf: jest.fn().mockReturnValue(of({ data: [MOCK_VRF] })),
    };

    mockApplicationProfileService = {
      getManyApplicationProfile: jest.fn().mockReturnValue(of({ data: [MOCK_AP] })),
    };

    mockSelectorService = {
      softDeleteOneSelector: jest.fn().mockReturnValue(of(null)),
      deleteOneSelector: jest.fn().mockReturnValue(of(null)),
      restoreOneSelector: jest.fn().mockReturnValue(of(null)),
      bulkUploadSelectors: jest.fn().mockReturnValue(of({})),
    };

    mockEndpointGroupService = {
      getManyEndpointGroup: jest.fn().mockReturnValue(of({ data: [MOCK_EPG] })),
      getOneEndpointGroup: jest.fn().mockReturnValue(of(MOCK_EPG)),
      updateOneEndpointGroup: jest.fn().mockReturnValue(of(MOCK_EPG)),
    };

    mockEntityService = {
      notify: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [EndpointSecurityGroupModalComponent],
      imports: [ReactiveFormsModule, NgSelectModule],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: V2AppCentricEndpointSecurityGroupsService, useValue: mockEndpointSecurityGroupService },
        { provide: V2AppCentricVrfsService, useValue: mockVrfService },
        { provide: V2AppCentricApplicationProfilesService, useValue: mockApplicationProfileService },
        { provide: V2AppCentricSelectorsService, useValue: mockSelectorService },
        { provide: V2AppCentricEndpointGroupsService, useValue: mockEndpointGroupService },
        { provide: EntityService, useValue: mockEntityService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EndpointSecurityGroupModalComponent);
    component = fixture.componentInstance;
    component.tenantId = 'tenant-1';
    component.consumedContractRef = { clearSelectedContract: jest.fn() } as any;
    component.providedContractRef = { clearSelectedContract: jest.fn() } as any;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getEndpointGroups and buildForm on init', () => {
    const getEndpointGroupsSpy = jest.spyOn(component, 'getEndpointGroups');
    const buildFormSpy = jest.spyOn(component as any, 'buildForm');
    component.ngOnInit();
    expect(getEndpointGroupsSpy).toHaveBeenCalled();
    expect(buildFormSpy).toHaveBeenCalled();
  });

  describe('getEndpointSecurityGroup', () => {
    const mockSelectors = [
      { selectorType: SelectorSelectorTypeEnum.Tag, tagKey: 'test' },
      { selectorType: SelectorSelectorTypeEnum.Epg, endpointGroupName: 'epg-test' },
      { selectorType: SelectorSelectorTypeEnum.IpSubnet, IpSubnet: '1.1.1.1' },
      { selectorType: 'other', info: 'should go to IpSubnet' },
    ];
    beforeEach(() => {
      mockEndpointSecurityGroupService.getOneEndpointSecurityGroup.mockReturnValue(of({ selectors: mockSelectors }));
    });

    it('should clear selectors and populate them from the service call', () => {
      component.tagSelectors.data = ['stale'] as any;
      component.getEndpointSecurityGroup('esg-1');
      expect(mockEndpointSecurityGroupService.getOneEndpointSecurityGroup).toHaveBeenCalledWith({
        id: 'esg-1',
        join: ['selectors'],
      });
      expect(component.tagSelectors.data).toEqual([mockSelectors[0]]);
      expect(component.epgSelectors.data).toEqual([mockSelectors[1]]);
      expect(component.IpSubnetSelectors.data).toEqual([mockSelectors[2], mockSelectors[3]]);
    });
  });

  describe('getData', () => {
    it('should set component properties and form for Edit mode', () => {
      mockNgxSmartModalService.getModalData.mockReturnValue({
        modalMode: ModalMode.Edit,
        endpointSecurityGroup: MOCK_ESG,
        selectors: [],
      });
      const getVrfsSpy = jest.spyOn(component, 'getVrfs');
      const getAppProfilesSpy = jest.spyOn(component, 'getApplicationProfiles');

      component.getData();

      expect(getVrfsSpy).toHaveBeenCalled();
      expect(getAppProfilesSpy).toHaveBeenCalled();
      expect(component.ModalMode).toBe(ModalMode.Edit);
      expect(component.endpointSecurityGroupId).toBe('esg-1');
      expect(component.esgVrfId).toBe('vrf-1');

      const form = component.form;
      expect(form.get('name').value).toBe(MOCK_ESG.name);
      expect(form.get('name').disabled).toBe(true);
      expect(form.get('vrfId').value).toBe(MOCK_ESG.vrfId);
      expect(form.get('vrfId').disabled).toBe(true);
      expect(form.get('applicationProfileId').value).toBe(MOCK_ESG.applicationProfileId);
      expect(form.get('applicationProfileId').disabled).toBe(true);
    });

    it('should set component properties and form for Create mode', () => {
      mockNgxSmartModalService.getModalData.mockReturnValue({
        modalMode: ModalMode.Create,
        endpointSecurityGroup: undefined,
      });

      component.getData();

      expect(component.ModalMode).toBe(ModalMode.Create);
      const form = component.form;
      expect(form.get('name').enabled).toBe(true);
      expect(form.get('intraEsgIsolation').value).toBe(true);
      expect(form.get('adminState').value).toBe('AdminUp');
      expect(form.get('preferredGroupMember').value).toBe(true);
    });

    it('should correctly sort selectors when loading in Edit mode', () => {
      const mockSelectors = [
        { selectorType: SelectorSelectorTypeEnum.Tag, tagKey: 'test' },
        { selectorType: SelectorSelectorTypeEnum.Epg, endpointGroupName: 'epg-test' },
        { selectorType: SelectorSelectorTypeEnum.IpSubnet, IpSubnet: '1.1.1.1' },
        { selectorType: 'other', info: 'should go to IpSubnet' },
      ];
      mockNgxSmartModalService.getModalData.mockReturnValue({
        modalMode: ModalMode.Edit,
        endpointSecurityGroup: MOCK_ESG,
        selectors: mockSelectors,
      });

      component.getData();

      expect(component.tagSelectors.data).toEqual([mockSelectors[0]]);
      expect(component.epgSelectors.data).toEqual([mockSelectors[1]]);
      expect(component.IpSubnetSelectors.data).toEqual([mockSelectors[2], mockSelectors[3]]);
    });
  });

  describe('save', () => {
    beforeEach(() => {
      component.form.setValue({
        name: 'new-esg',
        description: 'new-desc',
        preferredGroupMember: false,
        adminState: 'AdminDown',
        intraEsgIsolation: false,
        applicationProfileId: 'ap-1',
        vrfId: 'vrf-1',
      });
    });

    it('should not save if form is invalid', () => {
      component.form.get('name').setValue('');
      const createSpy = jest.spyOn(component as any, 'createEndpointSecurityGroup');
      component.save();
      expect(createSpy).not.toHaveBeenCalled();
      expect(component.submitted).toBe(true);
    });

    it('should call createEndpointSecurityGroup when in Create mode', () => {
      component.ModalMode = ModalMode.Create;
      const createSpy = jest.spyOn(component as any, 'createEndpointSecurityGroup').mockImplementation();
      component.save();

      const expectedPayload = {
        name: 'new-esg',
        description: 'new-desc',
        preferredGroupMember: false,
        adminState: 'AdminDown',
        intraEsgIsolation: false,
        applicationProfileId: 'ap-1',
        vrfId: 'vrf-1',
        tenantId: 'tenant-1',
      };
      expect(createSpy).toHaveBeenCalledWith(expect.objectContaining(expectedPayload));
    });

    it('should call editEndpointSecurityGroup when in Edit mode', () => {
      component.ModalMode = ModalMode.Edit;
      const editSpy = jest.spyOn(component as any, 'editEndpointSecurityGroup').mockImplementation();
      component.save();
      const expectedPayload = {
        name: 'new-esg',
        description: 'new-desc',
        preferredGroupMember: false,
        adminState: 'AdminDown',
        intraEsgIsolation: false,
        applicationProfileId: 'ap-1',
        vrfId: 'vrf-1',
        tenantId: 'tenant-1',
      };
      expect(editSpy).toHaveBeenCalledWith(expect.objectContaining(expectedPayload));
    });
  });

  describe('f', () => {
    it('should return form controls', () => {
      expect(component.f).toBe(component.form.controls);
    });
  });

  describe('openSelectorModal', () => {
    it('should prepare data, subscribe, and open the selector modal', () => {
      const initialEpgSelectors = [{ id: 'epg-selector-1' }];
      component.epgSelectors.data = initialEpgSelectors as any;
      component.tagSelectors.data = [{ id: 'tag-selector-1' }] as any;
      component.IpSubnetSelectors.data = [{ id: 'ip-subnet-selector-1' }] as any;
      const subscribeSpy = jest.spyOn(component, 'subscribeToSelectorModal').mockImplementation();

      component.openSelectorModal();

      expect(subscribeSpy).toHaveBeenCalled();

      const expectedDto = new SelectorModalDto();
      expectedDto.selector = { existingEpgSelectors: initialEpgSelectors } as any;

      expect(mockNgxSmartModalService.setModalData).toHaveBeenCalledWith(expectedDto, 'selectorModal');

      expect(component.tagSelectors.data).toEqual([]);
      expect(component.epgSelectors.data).toEqual([]);
      expect(component.IpSubnetSelectors.data).toEqual([]);
      expect(mockModal.open).toHaveBeenCalled();
    });
  });

  describe('subscribeToSelectorModal', () => {
    it('should reset modal data, unsubscribe, and refresh ESG data when modal closes', () => {
      component.endpointSecurityGroupId = 'esg-123';
      const getEsgSpy = jest.spyOn(component, 'getEndpointSecurityGroup').mockImplementation();

      component.subscribeToSelectorModal();
      const subscription = component.selectorModalSubscription;
      const unsubscribeSpy = jest.spyOn(subscription, 'unsubscribe');

      mockModalOnCloseFinished.next();

      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('selectorModal');
      expect(unsubscribeSpy).toHaveBeenCalled();
      expect(getEsgSpy).toHaveBeenCalledWith('esg-123');
    });
  });

  describe('onTableEvent', () => {
    it('should update the tableComponentDto and call getApplicationProfiles', () => {
      const getAppProfilesSpy = jest.spyOn(component, 'getApplicationProfiles').mockImplementation();
      const mockEvent = { page: 2, perPage: 20 };

      component.onTableEvent(mockEvent);

      expect(component.tableComponentDto).toEqual(mockEvent);
      expect(getAppProfilesSpy).toHaveBeenCalled();
    });
  });

  describe('handleTabChange', () => {
    it('should update currentTab and initialTabIndex when a valid tab is provided', () => {
      const getIndexSpy = jest.spyOn(component as any, 'getInitialTabIndex').mockReturnValue(1);
      const newTab = { name: 'Consumed Contracts' };

      component.handleTabChange(newTab);

      expect(component.currentTab).toBe('Consumed Contracts');
      expect(getIndexSpy).toHaveBeenCalled();
      expect(component.initialTabIndex).toBe(1);
    });

    it('should do nothing if the tab is null', () => {
      const initialTab = component.currentTab;
      const getIndexSpy = jest.spyOn(component as any, 'getInitialTabIndex');

      component.handleTabChange(null);

      expect(component.currentTab).toBe(initialTab);
      expect(getIndexSpy).not.toHaveBeenCalled();
    });
  });

  describe('closeModal', () => {
    it('should call reset and then close the modal', () => {
      const resetSpy = jest.spyOn(component, 'reset').mockImplementation();
      component.closeModal();
      expect(resetSpy).toHaveBeenCalled();
      expect(mockNgxSmartModalService.close).toHaveBeenCalledWith('endpointSecurityGroupModal');
    });
  });

  describe('reset', () => {
    it('should reset the form and clear the provided contracts', () => {
      jest.spyOn(component, 'buildForm').mockImplementation();
      jest.spyOn(mockNgxSmartModalService, 'resetModalData').mockImplementation();
      component.providedContractRef = { clearSelectedContract: jest.fn() } as any;
      const newTab = { name: 'Provided Contracts' };
      component.handleTabChange(newTab);
      component.reset();
      expect(component.providedContractRef.clearSelectedContract).toHaveBeenCalled();
    });

    it('should reset the form and clear the consumed contracts', () => {
      jest.spyOn(component, 'buildForm').mockImplementation();
      jest.spyOn(mockNgxSmartModalService, 'resetModalData').mockImplementation();
      component.consumedContractRef = { clearSelectedContract: jest.fn() } as any;
      const newTab = { name: 'Consumed Contracts' };
      component.handleTabChange(newTab);
      component.reset();
      expect(component.consumedContractRef.clearSelectedContract).toHaveBeenCalled();
    });
  });

  describe('createEndpointSecurityGroup', () => {
    it('should call the service to create an ESG and then close the modal on success', () => {
      const closeModalSpy = jest.spyOn(component, 'closeModal').mockImplementation();
      const mockPayload: EndpointSecurityGroup = { name: 'test-esg' } as any;

      component.createEndpointSecurityGroup(mockPayload);

      expect(mockEndpointSecurityGroupService.createOneEndpointSecurityGroup).toHaveBeenCalledWith({
        endpointSecurityGroup: mockPayload,
      });
      expect(closeModalSpy).toHaveBeenCalled();
    });
  });

  describe('editEndpointSecurityGroup', () => {
    it('should remove non-editable fields, call the update service, and close modal', () => {
      component.endpointSecurityGroupId = 'esg-1';
      const closeModalSpy = jest.spyOn(component, 'closeModal').mockImplementation();

      const payload: EndpointSecurityGroup = {
        name: 'esg-name',
        tenantId: 'tenant-1',
        applicationProfileId: 'ap-1',
        vrfId: 'vrf-1',
        description: 'new-desc',
        adminState: 'AdminDown' as EndpointSecurityGroupAdminStateEnum,
        preferredGroupMember: true,
        intraEsgIsolation: false,
      };

      // The function mutates the payload, so this is what it should look like after deletion
      const expectedPayload = {
        description: 'new-desc',
        adminState: 'AdminDown' as EndpointSecurityGroupAdminStateEnum,
        preferredGroupMember: true,
        intraEsgIsolation: false,
      };

      component.editEndpointSecurityGroup(payload);

      expect(mockEndpointSecurityGroupService.updateOneEndpointSecurityGroup).toHaveBeenCalledWith({
        id: 'esg-1',
        endpointSecurityGroup: expectedPayload,
      });

      expect(closeModalSpy).toHaveBeenCalled();
    });
  });

  describe('getVrfs', () => {
    it('should load vrfs and stop loading on success', () => {
      component.getVrfs();

      expect(mockVrfService.getManyVrf).toHaveBeenCalledWith({
        filter: ['tenantId||eq||tenant-1', 'deletedAt||isnull'],
        page: 1,
        perPage: 1000,
      });
      expect(component.vrfs).toEqual([MOCK_VRF]);
      expect(component.isLoading).toBe(false);
    });

    it('should set vrfs to null and stop loading on service error', () => {
      mockVrfService.getManyVrf.mockReturnValue(throwError(() => new Error('test error')));
      component.vrfs = [MOCK_VRF];
      component.getVrfs();
      expect(component.vrfs).toBeNull();
      expect(component.isLoading).toBe(false);
    });
  });

  describe('getApplicationProfiles', () => {
    it('should load application profiles and stop loading on success', () => {
      mockApplicationProfileService.getManyApplicationProfile.mockReturnValue(of([MOCK_AP]));
      component.getApplicationProfiles();

      expect(mockApplicationProfileService.getManyApplicationProfile).toHaveBeenCalledWith({
        filter: ['tenantId||eq||tenant-1', 'deletedAt||isnull'],
      });
      expect(component.applicationProfiles).toEqual([MOCK_AP]);
      expect(component.isLoading).toBe(false);
    });

    it('should set application profiles to null and stop loading on service error', () => {
      mockApplicationProfileService.getManyApplicationProfile.mockReturnValue(throwError(() => new Error('test error')));
      component.applicationProfiles = [MOCK_AP]; // pre-set data
      component.getApplicationProfiles();
      expect(component.applicationProfiles).toBeNull();
      expect(component.isLoading).toBe(false);
    });
  });

  describe('softDeleteSelector', () => {
    it('should call the soft delete service and then refresh the ESG data', () => {
      const mockSelector = { id: 'selector-1' } as any;
      component.endpointSecurityGroupId = 'esg-1';
      const getEsgSpy = jest.spyOn(component, 'getEndpointSecurityGroup').mockImplementation();

      component.softDeleteSelector(mockSelector);

      expect(mockSelectorService.softDeleteOneSelector).toHaveBeenCalledWith({ id: 'selector-1' });
      expect(getEsgSpy).toHaveBeenCalledWith('esg-1');
    });
  });

  describe('hardDeleteSelector', () => {
    it('should call the hard delete service and then refresh the ESG data', () => {
      const mockSelector = { id: 'selector-1' } as any;
      component.endpointSecurityGroupId = 'esg-1';
      const getEsgSpy = jest.spyOn(component, 'getEndpointSecurityGroup').mockImplementation();

      component.hardDeleteSelector(mockSelector);

      expect(mockSelectorService.deleteOneSelector).toHaveBeenCalledWith({ id: 'selector-1' });
      expect(getEsgSpy).toHaveBeenCalledWith('esg-1');
    });
  });

  describe('restoreSelector', () => {
    it('should call the restore service and then refresh the ESG data', () => {
      const mockSelector = { id: 'selector-1' } as any;
      component.endpointSecurityGroupId = 'esg-1';
      const getEsgSpy = jest.spyOn(component, 'getEndpointSecurityGroup').mockImplementation();

      component.restoreSelector(mockSelector);

      expect(mockSelectorService.restoreOneSelector).toHaveBeenCalledWith({ id: 'selector-1' });
      expect(getEsgSpy).toHaveBeenCalledWith('esg-1');
    });
  });

  describe('retrieveAndUpdateEndpointGroup', () => {
    it('should get an EPG, remove non-editable fields, and call the update service', () => {
      const mockEpg: EndpointGroup = {
        id: 'epg-1',
        name: 'epg-name',
        tenantId: 'tenant-1',
        applicationProfileId: 'ap-1',
        description: 'test-description',
        intraEpgIsolation: false,
        bridgeDomainId: 'bd-1',
      };
      mockEndpointGroupService.getOneEndpointGroup.mockReturnValue(of({ ...mockEpg }));

      component.retrieveAndUpdateEndpointGroup('epg-1');

      expect(mockEndpointGroupService.getOneEndpointGroup).toHaveBeenCalledWith({ id: 'epg-1' });

      const expectedPayload = { ...mockEpg };
      delete expectedPayload.name;
      delete expectedPayload.tenantId;
      delete expectedPayload.applicationProfileId;

      expect(mockEndpointGroupService.updateOneEndpointGroup).toHaveBeenCalledWith({
        id: 'epg-1',
        endpointGroup: expectedPayload,
      });
    });
  });

  describe('importSelectors', () => {
    const mockSelectorsEvent = [{ id: 's1' }, { id: 's2' }];
    let subscribeToYesNoModalSpy;

    beforeEach(() => {
      subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
    });

    it('should show a confirmation modal with a plural message for multiple items', () => {
      component.importSelectors(mockSelectorsEvent);

      const expectedDto = new YesNoModalDto('Import Selectors', 'Are you sure you would like to import 2 Selectors?');

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(
        expectedDto,
        mockNgxSmartModalService,
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('should show a confirmation modal with a singular message for a single item', () => {
      component.importSelectors([{ id: 's1' }]);
      const expectedDto = new YesNoModalDto('Import Selectors', 'Are you sure you would like to import 1 Selector?');
      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(
        expectedDto,
        mockNgxSmartModalService,
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('should sanitize, bulk upload, and refresh data on confirm', () => {
      const sanitizedData = [{ id: 's1-sanitized' }];
      const sanitizeSpy = jest.spyOn(component, 'sanitizeSelectorData').mockReturnValue(sanitizedData);
      const getEsgSpy = jest.spyOn(component, 'getEndpointSecurityGroup').mockImplementation();
      component.endpointSecurityGroupId = 'esg-1';

      component.importSelectors(mockSelectorsEvent);

      // Get the confirm function from the spy and call it
      const confirmFn = subscribeToYesNoModalSpy.mock.calls[0][2];
      confirmFn();

      expect(sanitizeSpy).toHaveBeenCalledWith(mockSelectorsEvent);
      expect(mockSelectorService.bulkUploadSelectors).toHaveBeenCalledWith({ requestBody: sanitizedData });

      // Manually trigger the complete callback for the inner subscription
      mockSelectorService.bulkUploadSelectors.mock.results[0].value.subscribe({
        complete: () => {
          expect(getEsgSpy).toHaveBeenCalledWith('esg-1');
        },
      });
    });

    it('should refresh data on close/cancel', () => {
      const sanitizeSpy = jest.spyOn(component, 'sanitizeSelectorData');
      const getEsgSpy = jest.spyOn(component, 'getEndpointSecurityGroup').mockImplementation();
      component.endpointSecurityGroupId = 'esg-1';

      component.importSelectors(mockSelectorsEvent);

      // Get the close function from the spy and call it
      const closeFn = subscribeToYesNoModalSpy.mock.calls[0][3];
      closeFn();

      expect(sanitizeSpy).not.toHaveBeenCalled();
      expect(mockSelectorService.bulkUploadSelectors).not.toHaveBeenCalled();
      expect(getEsgSpy).toHaveBeenCalledWith('esg-1');
    });
  });

  describe('sanitizeSelectorData', () => {
    it('should call mapSelectorToCsv for each entity in the array', () => {
      const entities = [{}, {}];
      const mapSpy = jest.spyOn(component, 'mapSelectorToCsv').mockImplementation();
      component.sanitizeSelectorData(entities);
      expect(mapSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('mapSelectorToCsv', () => {
    let getObjectIdSpy;

    beforeEach(() => {
      getObjectIdSpy = jest.spyOn(ObjectUtil, 'getObjectId');
      component.vrfs = [{ id: 'vrf-id-from-list', name: 'test-vrf' }] as any;
      component.endpointGroups = [{ id: 'epg-id-from-list', name: 'test-epg' }] as any;
      component.tenantId = 'tenant-id-from-component';
      component.endpointSecurityGroupId = 'esg-id-from-component';
    });

    it('should convert string booleans to real booleans', () => {
      const obj = { p1: 'true', p2: 'false', p3: 't', p4: 'f' };
      const result = component.mapSelectorToCsv(obj);
      expect(result.p1).toBe(true);
      expect(result.p2).toBe(false);
      expect(result.p3).toBe(true);
      expect(result.p4).toBe(false);
    });

    it('should delete null and empty string properties', () => {
      const obj = { p1: null, p2: '', p3: 'has-value' };
      const result = component.mapSelectorToCsv(obj);
      expect(result.hasOwnProperty('p1')).toBe(false);
      expect(result.hasOwnProperty('p2')).toBe(false);
      expect(result.p3).toBe('has-value');
    });

    describe('EPGName mapping', () => {
      it('should map EPGName to endpointGroupId when found', () => {
        getObjectIdSpy.mockReturnValue('epg-id-from-list');
        const obj = { EPGName: 'test-epg' };
        const result = component.mapSelectorToCsv(obj);
        expect(result.endpointGroupName).toBe('test-epg');
        expect(result.endpointGroupId).toBe('epg-id-from-list');
        expect(result.hasOwnProperty('EPGName')).toBe(false);
        expect(getObjectIdSpy).toHaveBeenCalledWith('test-epg', component.endpointGroups);
      });

      it('should use original value if EPGName not found', () => {
        getObjectIdSpy.mockReturnValue('not-found-epg');
        const obj = { EPGName: 'not-found-epg' };
        const result = component.mapSelectorToCsv(obj);
        expect(result.endpointGroupName).toBe('not-found-epg');
        expect(result.endpointGroupId).toBe('not-found-epg');
        expect(result.hasOwnProperty('EPGName')).toBe(false);
      });

      it('should not set endpointGroupName if EPGName is empty', () => {
        const obj = { EPGName: '' };
        const result = component.mapSelectorToCsv(obj);
        expect(result.hasOwnProperty('endpointGroupName')).toBe(false);
      });
    });

    it('should map endpointSecurityGroupName to endpointSecurityGroupId', () => {
      const obj = { endpointSecurityGroupName: 'some-name' };
      const result = component.mapSelectorToCsv(obj);
      expect(result.endpointSecurityGroupId).toBe('esg-id-from-component');
      expect(result.hasOwnProperty('endpointSecurityGroupName')).toBe(false);
    });

    it('should map vrfName to vrfId', () => {
      getObjectIdSpy.mockReturnValue('vrf-id-from-list');
      const obj = { vrfName: 'test-vrf' };
      const result = component.mapSelectorToCsv(obj);
      expect(result.vrfId).toBe('vrf-id-from-list');
      expect(result.hasOwnProperty('vrfName')).toBe(false);
      expect(getObjectIdSpy).toHaveBeenCalledWith('test-vrf', component.vrfs);
    });

    it('should map tenantName to tenantId', () => {
      const obj = { tenantName: 'some-tenant' };
      const result = component.mapSelectorToCsv(obj);
      expect(result.tenantId).toBe('tenant-id-from-component');
      expect(result.hasOwnProperty('tenantName')).toBe(false);
    });
  });
});
