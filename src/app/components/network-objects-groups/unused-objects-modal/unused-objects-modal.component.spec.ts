import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockNgxSmartModalComponent, MockComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { V1NetworkSecurityNetworkObjectsService } from 'client';
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
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1NetworkSecurityNetworkObjectsService)],
    });
    fixture = TestBed.createComponent(UnusedObjectsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete network object', () => {
    const service = TestBed.inject(V1NetworkSecurityNetworkObjectsService);
    const networkObject = { id: '1' } as any;
    const softDeleteSpy = jest.spyOn(service, 'softDeleteOneNetworkObject');

    jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
      onConfirm();

      return new Subscription();
    });
    component.softDeleteNetworkObject(networkObject);

    expect(softDeleteSpy).toHaveBeenCalledWith({ id: networkObject.id });
  });
});
