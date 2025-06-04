import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockNgxSmartModalComponent } from 'src/test/mock-components';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirewallRuleObjectInfoModalComponent } from './firewall-rule-object-info-modal.component';

describe('FirewallRuleObjectInfoModalComponent', () => {
  let component: FirewallRuleObjectInfoModalComponent;
  let fixture: ComponentFixture<FirewallRuleObjectInfoModalComponent>;
  let mockNgxSmartModalService: any;

  beforeEach(() => {
    mockNgxSmartModalService = {
      getModalData: jest.fn().mockReturnValue({ modalTitle: 'modalTitle!', modalBody: 'modalBody!' }),
    };
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, NgxPaginationModule],
      declarations: [FirewallRuleObjectInfoModalComponent, MockNgxSmartModalComponent],
      providers: [{ provide: NgxSmartModalService, useValue: mockNgxSmartModalService }],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FirewallRuleObjectInfoModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should getModalData', () => {
    component.getData();
    expect(component.modalTitle).toEqual('modalTitle!');
    expect(component.modalBody).toEqual('modalBody!');
  });
});
