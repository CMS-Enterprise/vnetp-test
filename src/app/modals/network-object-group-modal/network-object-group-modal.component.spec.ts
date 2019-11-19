import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkObjectGroupModalComponent } from './network-object-group-modal.component';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NetworkObjectGroup } from 'src/app/models/network-objects/network-object-group';
import { NetworkObject } from 'src/app/models/network-objects/network-object';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';

describe('NetworkObjectGroupModalComponent', () => {
  let component: NetworkObjectGroupModalComponent;
  let fixture: ComponentFixture<NetworkObjectGroupModalComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        NgxSmartModalModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [NetworkObjectGroupModalComponent, TooltipComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: ngx },
        FormBuilder,
        Validators,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkObjectGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have network object group form', () => {
    expect(component.form).toBeTruthy();
  });

  it('save should set ngxModal data', () => {
    component.form.controls.name.setValue('Name');
    component.form.controls.description.setValue('Description');
    component.networkObjects.push({ Name: 'Test' } as NetworkObject);
    expect(component.form.valid).toBeTruthy();
    component.save();

    // Get Data from the modal service
    const modal = ngx.getModal('networkObjectGroupModal');
    const data = modal.getData() as NetworkObjectGroup;

    // Ensure that it is equal to our test data.
    expect(data.Name === 'Name').toBeTruthy();
    expect(data.Description === 'Description').toBeTruthy();
    expect(data.NetworkObjects[0].Name === 'Test').toBeTruthy();
  });

  // Initial Form State
  it('name should be required', () => {
    const name = component.form.controls.name;
    expect(name.valid).toBeFalsy();
  });

  it('description should not be required', () => {
    const description = component.form.controls.description;
    expect(description.valid).toBeTruthy();
  });
});
