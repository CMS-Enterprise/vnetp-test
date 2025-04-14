/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockNgSelectComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { V1DatacentersService, V1NetworkSecurityFirewallRuleGroupsService, V1TiersService, V3GlobalMessagesService } from 'client';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { FirewallRuleGroupModalComponent } from './firewall-rule-group-modal.component';

describe('FirewallRuleGroupModalComponent', () => {
  let component: FirewallRuleGroupModalComponent;
  let fixture: ComponentFixture<FirewallRuleGroupModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [
        FirewallRuleGroupModalComponent,
        MockNgxSmartModalComponent,
        MockIconButtonComponent,
        MockFontAwesomeComponent,
        MockNgSelectComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1NetworkSecurityFirewallRuleGroupsService),
        MockProvider(V1TiersService),
        MockProvider(V1DatacentersService),
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FirewallRuleGroupModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngx.close with the correct argument when cancelled', () => {
    const ngx = component['ngx'];

    const ngxSpy = jest.spyOn(ngx, 'close');

    component['closeModal']();

    expect(ngxSpy).toHaveBeenCalledWith('firewallRuleGroupModal');
  });

  it('should reset the form when closing the modal', () => {
    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();
  });

  it('should call to create a rule group when the form is valid', () => {
    const service = TestBed.inject(V1NetworkSecurityFirewallRuleGroupsService);
    const createRuleGroupSpy = jest.spyOn(service, 'createOneFirewallRuleGroup');

    component.modalMode = ModalMode.Create;
    component.form.setValue({
      name: 'Group1',
      tier: 'tier1',
      groupType: 'ZoneBased',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createRuleGroupSpy).toHaveBeenCalled();
  });

  it('should not call to create a rule group when the form is invalid', () => {
    const service = TestBed.inject(V1NetworkSecurityFirewallRuleGroupsService);
    const createFWRuleGroupSpy = jest.spyOn(service, 'createOneFirewallRuleGroup');

    component.modalMode = ModalMode.Create;
    component.form.setValue({
      name: 'Group1',
      tier: '',
      groupType: 'ZoneBased',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createFWRuleGroupSpy).not.toHaveBeenCalled();
  });
});
