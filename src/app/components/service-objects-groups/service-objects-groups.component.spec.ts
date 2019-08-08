import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceObjectsGroupsComponent } from './service-objects-groups.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { PapaParseModule } from 'ngx-papaparse';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ServiceObjectModalComponent } from 'src/app/modals/service-object-modal/service-object-modal.component';
import { ServiceObjectGroupModalComponent } from 'src/app/modals/service-object-group-modal/service-object-group-modal.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { ServiceObject } from 'src/app/models/service-objects/service-object';
import { ServiceObjectGroup } from 'src/app/models/service-objects/service-object-group';
import { ImportExportComponent } from '../import-export/import-export.component';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ServicesObjectsGroupsComponent', () => {
  let component: ServiceObjectsGroupsComponent;
  let fixture: ComponentFixture<ServiceObjectsGroupsComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AngularFontAwesomeModule,
        NgxSmartModalModule,
        NgxMaskModule.forRoot(),
        PapaParseModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule
      ],
     declarations: [
      ServiceObjectsGroupsComponent,
      ServiceObjectModalComponent,
      ServiceObjectGroupModalComponent,
      ImportExportComponent,
      TooltipComponent
    ],
     providers: [{ provide: NgxSmartModalService, useValue: ngx}, CookieService, FormBuilder],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceObjectsGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create service object', () => {
    component.createServiceObject();
    expect(component.serviceObjectModalMode === ModalMode.Create).toBeTruthy();
    expect(component.serviceObjectModalSubscription).toBeTruthy();
  });

  it('should edit service object', () => {
    component.serviceObjects = [ { Name: 'Test'} as ServiceObject,
    { Name: 'Test2'} as ServiceObject];

    component.editServiceObject(component.serviceObjects[1]);
    expect(component.editServiceObjectIndex === 1).toBeTruthy();
    expect(component.serviceObjectGroupModalMode === ModalMode.Edit);
    expect(component.serviceObjectModalSubscription).toBeTruthy();
  });

  it('should save new service object', () => {
    component.createServiceObject();

    const serviceObject = { Name: 'Test' } as ServiceObject;

    component.saveServiceObject(serviceObject);

    expect(component.serviceObjects[0].Name === 'Test');
    expect(component.dirty).toBeTruthy();
  });

  it('should edit service object', () => {
    component.serviceObjects = [ { Name: 'Test'} as ServiceObject,
    { Name: 'Test2'} as ServiceObject];

    component.editServiceObject(component.serviceObjects[1]);

    const serviceObject = { Name: 'Updated' } as ServiceObject;

    component.saveServiceObject(serviceObject);

    expect(component.serviceObjects[1].Name === 'Updated').toBeTruthy();
    expect(component.dirty).toBeTruthy();
  });

  it('should delete service object', () => {
    component.serviceObjects = [ { Name: 'Test'} as ServiceObject,
    { Name: 'Test2'} as ServiceObject];

    component.deleteServiceObject(component.serviceObjects[1]);
    expect(component.deletedServiceObjects.length === 1).toBeTruthy();
    expect(component.serviceObjects.length === 1).toBeTruthy();
  });

  it('should create service object group', () => {
    component.createServiceObjectGroup();
    expect(component.serviceObjectGroupModalMode === ModalMode.Create).toBeTruthy();
    expect(component.serviceObjectGroupModalSubscription).toBeTruthy();
  });

  it('should edit service object group', () => {
    component.serviceObjectGroups = [ { Name: 'Test'} as ServiceObjectGroup,
    { Name: 'Test2'} as ServiceObjectGroup];

    component.editServiceObjectGroup(component.serviceObjectGroups[1]);
    expect(component.editServiceObjectGroupIndex === 1).toBeTruthy();
    expect(component.serviceObjectGroupModalMode === ModalMode.Edit);
    expect(component.serviceObjectGroupModalSubscription).toBeTruthy();
  });

  it('should save new service object group', () => {
    component.createServiceObjectGroup();

    const serviceObjectGroup = { Name: 'Test' } as ServiceObjectGroup;

    component.saveServiceObjectGroup(serviceObjectGroup);

    expect(component.serviceObjectGroups[0].Name === 'Test');
    expect(component.dirty).toBeTruthy();
  });

  it('should edit service object group', () => {
    component.serviceObjectGroups = [ { Name: 'Test'} as ServiceObjectGroup,
    { Name: 'Test2'} as ServiceObjectGroup];

    component.editServiceObjectGroup(component.serviceObjectGroups[1]);

    const serviceObjectGroup = { Name: 'Updated' } as ServiceObjectGroup;

    component.saveServiceObjectGroup(serviceObjectGroup);

    expect(component.serviceObjectGroups[1].Name === 'Updated').toBeTruthy();
    expect(component.dirty).toBeTruthy();
  });

  it('should delete service object group', () => {
    component.serviceObjectGroups = [ { Name: 'Test'} as ServiceObjectGroup,
    { Name: 'Test2'} as ServiceObjectGroup];

    component.deleteServiceObjectGroup(component.serviceObjectGroups[1]);
    expect(component.serviceObjectGroups.length === 1).toBeTruthy();
    expect(component.deletedServiceObjectGroups.length === 1).toBeTruthy();
    expect(component.dirty).toBeTruthy();
  });
});
