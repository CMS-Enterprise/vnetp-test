import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule, HttpClient, HttpHandler } from '@angular/common/http';
import { NetworkObjectsGroupsComponent } from './network-objects-groups.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { CookieService } from 'ngx-cookie-service';
import { NetworkObjectModalComponent } from 'src/app/modals/network-object-modal/network-object-modal.component';
import { NetworkObjectGroupModalComponent } from 'src/app/modals/network-object-group-modal/network-object-group-modal.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { PapaParseModule } from 'ngx-papaparse';
import { ModalMode } from 'src/app/models/modal-mode';
import { NetworkObject } from 'src/app/models/network-object';
import { NetworkObjectGroup } from 'src/app/models/network-object-group';

describe('NetworkObjectsGroupsComponent', () => {
  let component: NetworkObjectsGroupsComponent;
  let fixture: ComponentFixture<NetworkObjectsGroupsComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AngularFontAwesomeModule,
         NgxSmartModalModule,
         NgxMaskModule,
         PapaParseModule,
         FormsModule,
         ReactiveFormsModule
       ],
      declarations: [
        NetworkObjectsGroupsComponent,
        NetworkObjectModalComponent,
        NetworkObjectGroupModalComponent],
      providers: [{provide: NgxSmartModalService, useValue: ngx }, HttpClientModule, HttpClient, HttpHandler, CookieService, FormBuilder],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkObjectsGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should import', () => {

   const objects = [{ GroupName: '', Name: 'Test1', Type: 'host', HostAddress: '1.1.1.1'},
      {GroupName: '', Name: 'Test2', Type: 'network', CidrAddress: '1.1.1.0/24'},
      {GroupName: 'Group1', Name: 'Test3', Type: 'host', CidrAddress: '1.1.1.1'},
      {GroupName: 'Group2', Name: 'Test4', Type: 'network', CidrAddress: '1.1.1.0/24'}, ];

   component.importObjects(objects);

   expect(component.networkObjects.length === 2).toBeTruthy();
   expect(component.networkObjectGroups.length === 2).toBeTruthy();
   expect(component.networkObjects[0].Name === 'Test1').toBeTruthy();
   expect(component.networkObjects[1].Name === 'Test2').toBeTruthy();
   expect(component.networkObjectGroups[0].NetworkObjects[0].Name === 'Test3').toBeTruthy();
   expect(component.networkObjectGroups[1].NetworkObjects[0].Name === 'Test4').toBeTruthy();
  });

  it('should create network object', () => {
    component.createNetworkObject();
    expect(component.networkObjectModalMode === ModalMode.Create).toBeTruthy();
  });

  it('should edit network object', () => {
    component.networkObjects = [ { Name: 'Test'} as NetworkObject,
    { Name: 'Test2'} as NetworkObject];

    component.editNetworkObject(component.networkObjects[1]);
    expect(component.editNetworkObjectIndex === 1).toBeTruthy();

    const modal = ngx.getModal('networkObjectModal');
    const data = modal.getData() as NetworkObject;

    expect(data.Name === 'Test2').toBeTruthy();
  });

  it('should save new network object', () => {
    component.createNetworkObject();

    const networkObject = { Name: 'Test' } as NetworkObject;

    component.saveNetworkObject(networkObject);

    expect(component.networkObjects[0].Name === 'Test');
    expect(component.dirty).toBeTruthy();
  });

  it('should edit network object', () => {
    component.networkObjects = [ { Name: 'Test'} as NetworkObject,
    { Name: 'Test2'} as NetworkObject];

    component.editNetworkObject(component.networkObjects[1]);

    const networkObject = { Name: 'Updated' } as NetworkObject;

    component.saveNetworkObject(networkObject);

    expect(component.networkObjects[1].Name === 'Updated').toBeTruthy();
    expect(component.dirty).toBeTruthy();
  });

  it('should delete network object', () => {
    component.networkObjects = [ { Name: 'Test'} as NetworkObject,
    { Name: 'Test2'} as NetworkObject];

    component.deleteNetworkObject(component.networkObjects[1]);
    expect(component.networkObjects.length === 1).toBeTruthy();
  });

  it('should create network object group', () => {
    component.createNetworkObjectGroup();
    expect(component.networkObjectGroupModalMode === ModalMode.Create).toBeTruthy();
  });

  it('should edit network object group', () => {
    component.networkObjectGroups = [ { Name: 'Test'} as NetworkObjectGroup,
    { Name: 'Test2'} as NetworkObjectGroup];

    component.editNetworkObjectGroup(component.networkObjectGroups[1]);
    expect(component.editNetworkObjectGroupIndex === 1).toBeTruthy();

    const modal = ngx.getModal('networkObjectGroupModal');
    const data = modal.getData() as NetworkObjectGroup;

    expect(data.Name === 'Test2').toBeTruthy();
  });

  it('should save new network object group', () => {
    component.createNetworkObjectGroup();

    const networkObjectGroup = { Name: 'Test' } as NetworkObjectGroup;

    component.saveNetworkObjectGroup(networkObjectGroup);

    expect(component.networkObjectGroups[0].Name === 'Test');
    expect(component.dirty).toBeTruthy();
  });

  it('should edit network object group', () => {
    component.networkObjectGroups = [ { Name: 'Test'} as NetworkObjectGroup,
    { Name: 'Test2'} as NetworkObjectGroup];

    component.editNetworkObjectGroup(component.networkObjectGroups[1]);

    const networkObjectGroup = { Name: 'Updated' } as NetworkObjectGroup;

    component.saveNetworkObjectGroup(networkObjectGroup);

    expect(component.networkObjectGroups[1].Name === 'Updated').toBeTruthy();
    expect(component.dirty).toBeTruthy();
  });

  it('should delete network object group', () => {
    component.networkObjectGroups = [ { Name: 'Test'} as NetworkObjectGroup,
    { Name: 'Test2'} as NetworkObjectGroup];

    component.deleteNetworkObjectGroup(component.networkObjectGroups[1]);
    expect(component.networkObjectGroups.length === 1).toBeTruthy();
  });
});
