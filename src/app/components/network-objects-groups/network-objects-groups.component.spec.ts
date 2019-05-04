// TODO: Write mock for ngxSmartModal to test subscribe
// unsubscribe and modal maninpulation.
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

describe('NetworkObjectsGroupsComponent', () => {
  let component: NetworkObjectsGroupsComponent;
  let fixture: ComponentFixture<NetworkObjectsGroupsComponent>;

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
      providers: [NgxSmartModalService, HttpClientModule, HttpClient, HttpHandler, CookieService, FormBuilder],
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
});
