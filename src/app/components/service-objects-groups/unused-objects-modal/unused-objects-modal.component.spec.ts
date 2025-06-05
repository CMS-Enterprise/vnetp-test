import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockNgxSmartModalComponent, MockComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { V1NetworkSecurityServiceObjectsService } from 'client';
import { UnusedObjectsModalComponent } from './unused-objects-modal.component';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Subscription } from 'rxjs';

describe('UnusedObjectsModalComponent', () => {
  let component: UnusedObjectsModalComponent;
  let fixture: ComponentFixture<UnusedObjectsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [
        UnusedObjectsModalComponent,
        MockNgxSmartModalComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
      ],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1NetworkSecurityServiceObjectsService)],
    });
    fixture = TestBed.createComponent(UnusedObjectsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete service object', () => {
    const service = TestBed.inject(V1NetworkSecurityServiceObjectsService);
    const serviceObject = { id: '1' } as any;
    const softDeleteSpy = jest.spyOn(service, 'softDeleteOneServiceObject');

    jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
      onConfirm();

      return new Subscription();
    });
    component.softDeleteServiceObject(serviceObject);

    expect(softDeleteSpy).toHaveBeenCalledWith({ id: serviceObject.id });
  });
});
