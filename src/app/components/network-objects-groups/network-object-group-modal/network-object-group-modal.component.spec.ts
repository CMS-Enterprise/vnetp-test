import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkObjectGroupModalComponent } from './network-object-group-modal.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockIconButtonComponent,
  MockNgxSmartModalComponent,
  MockNgSelectComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { V1NetworkSecurityNetworkObjectGroupsService, V1TiersService } from 'client';

describe('NetworkObjectGroupModalComponent', () => {
  let component: NetworkObjectGroupModalComponent;
  let fixture: ComponentFixture<NetworkObjectGroupModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [
        NetworkObjectGroupModalComponent,
        MockNgxSmartModalComponent,
        MockTooltipComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgSelectComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1TiersService),
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkObjectGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

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

  describe('Description', () => {
    it('should be optional', () => {
      const { description } = component.form.controls;

      description.setValue(null);
      expect(description.valid).toBe(true);
    });

    it('should have a minimum length of 3 and maximum length of 500', () => {
      const { description } = component.form.controls;

      description.setValue('a');
      expect(description.valid).toBe(false);

      description.setValue('a'.repeat(3));
      expect(description.valid).toBe(true);

      description.setValue('a'.repeat(501));
      expect(description.valid).toBe(false);
    });
  });
});
