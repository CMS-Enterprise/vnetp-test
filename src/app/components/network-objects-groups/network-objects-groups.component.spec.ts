import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkObjectsGroupsComponent } from './network-objects-groups.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { CookieService } from 'ngx-cookie-service';
import { NetworkObjectModalComponent } from 'src/app/modals/network-object-modal/network-object-modal.component';
import { NetworkObjectGroupModalComponent } from 'src/app/modals/network-object-group-modal/network-object-group-modal.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { PapaParseModule } from 'ngx-papaparse';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NetworkObject } from 'src/app/models/network-objects/network-object';
import { NetworkObjectGroup } from 'src/app/models/network-objects/network-object-group';
import { ImportExportComponent } from '../import-export/import-export.component';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';

describe('NetworkObjectsGroupsComponent', () => {
  let component: NetworkObjectsGroupsComponent;
  let fixture: ComponentFixture<NetworkObjectsGroupsComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        NgxSmartModalModule,
        NgxMaskModule,
        PapaParseModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
      ],
      declarations: [
        NetworkObjectsGroupsComponent,
        NetworkObjectModalComponent,
        NetworkObjectGroupModalComponent,
        TooltipComponent,
        ImportExportComponent,
      ],
      providers: [
        { provide: NgxSmartModalService, useValue: ngx },
        CookieService,
        FormBuilder,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkObjectsGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create network object', () => {
    component.createNetworkObject();
    expect(component.networkObjectModalSubscription).toBeTruthy();
    expect(component.networkObjectModalMode === ModalMode.Create).toBeTruthy();
  });

  it('should edit network object', () => {
    component.networkObjects = [
      { Name: 'Test' } as NetworkObject,
      { Name: 'Test2' } as NetworkObject,
    ];

    component.editNetworkObject(component.networkObjects[1]);
    expect(component.networkObjectModalSubscription).toBeTruthy();
    expect(component.editNetworkObjectIndex === 1).toBeTruthy();
    expect(component.networkObjectModalMode === ModalMode.Edit);
  });

  it('should save new network object', () => {
    component.createNetworkObject();

    const networkObject = { Name: 'Test' } as NetworkObject;

    component.saveNetworkObject(networkObject);

    expect(component.networkObjects[0].Name === 'Test');
    expect(component.dirty).toBeTruthy();
  });

  it('should edit network object', () => {
    component.networkObjects = [
      { Name: 'Test' } as NetworkObject,
      { Name: 'Test2' } as NetworkObject,
    ];

    component.editNetworkObject(component.networkObjects[1]);

    const networkObject = { Name: 'Updated' } as NetworkObject;

    component.saveNetworkObject(networkObject);

    expect(component.networkObjects[1].Name === 'Updated').toBeTruthy();
    expect(component.dirty).toBeTruthy();
  });

  it('should delete network object', () => {
    component.networkObjects = [
      { Name: 'Test' } as NetworkObject,
      { Name: 'Test2' } as NetworkObject,
    ];

    component.deleteNetworkObject(component.networkObjects[1]);
    expect(component.deletedNetworkObjects.length === 1).toBeTruthy();
    expect(component.networkObjects.length === 1).toBeTruthy();
  });

  it('should create network object group', () => {
    component.createNetworkObjectGroup();
    expect(component.networkObjectGroupModalSubscription).toBeTruthy();
    expect(
      component.networkObjectGroupModalMode === ModalMode.Create,
    ).toBeTruthy();
  });

  it('should set subscription, modal mode and index on edit', () => {
    component.networkObjectGroups = [
      { Name: 'Test' } as NetworkObjectGroup,
      { Name: 'Test2' } as NetworkObjectGroup,
    ];

    component.editNetworkObjectGroup(component.networkObjectGroups[1]);

    expect(component.networkObjectGroupModalSubscription).toBeTruthy();
    expect(component.networkObjectGroupModalMode === ModalMode.Edit);
    expect(component.editNetworkObjectGroupIndex === 1).toBeTruthy();
  });

  it('should save new network object group', () => {
    component.createNetworkObjectGroup();

    const networkObjectGroup = { Name: 'Test' } as NetworkObjectGroup;

    component.saveNetworkObjectGroup(networkObjectGroup);

    expect(component.networkObjectGroups[0].Name === 'Test');
    expect(component.dirty).toBeTruthy();
  });

  it('should edit network object group', () => {
    component.networkObjectGroups = [
      { Name: 'Test' } as NetworkObjectGroup,
      { Name: 'Test2' } as NetworkObjectGroup,
    ];

    component.editNetworkObjectGroup(component.networkObjectGroups[1]);

    const networkObjectGroup = { Name: 'Updated' } as NetworkObjectGroup;

    component.saveNetworkObjectGroup(networkObjectGroup);

    expect(component.networkObjectGroups[1].Name === 'Updated').toBeTruthy();
    expect(component.dirty).toBeTruthy();
  });

  it('should delete network object group', () => {
    component.networkObjectGroups = [
      { Name: 'Test' } as NetworkObjectGroup,
      { Name: 'Test2' } as NetworkObjectGroup,
    ];

    component.deleteNetworkObjectGroup(component.networkObjectGroups[1]);
    expect(component.networkObjectGroups.length === 1).toBeTruthy();
    expect(component.deletedNetworkObjectGroups.length === 1).toBeTruthy();
    expect(component.dirty).toBeTruthy();
  });
});
