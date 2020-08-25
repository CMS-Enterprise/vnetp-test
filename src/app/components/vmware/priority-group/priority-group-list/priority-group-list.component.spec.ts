import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { PriorityGroupListComponent } from './priority-group-list.component';
import { of, Subject } from 'rxjs';
import { V1PriorityGroupsService, PriorityGroup } from 'api_client';
import { NgxPaginationModule } from 'ngx-pagination';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { MockProvider } from 'src/test/mock-providers';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('PriorityGroupListComponent', () => {
  let component: PriorityGroupListComponent;
  let fixture: ComponentFixture<PriorityGroupListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgxPaginationModule],
      declarations: [
        MockComponent({ selector: 'app-priority-group-modal' }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        PriorityGroupListComponent,
        YesNoModalComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1PriorityGroupsService)],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(PriorityGroupListComponent);
        component = fixture.componentInstance;
        component.datacenterId = 'datacenterId';
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Deleting', () => {
    it('should throw an error when deleting a provisioned priority group', () => {
      const throwsError = () => {
        const pg = { provisionedAt: {} } as PriorityGroup;
        component.deletePriorityGroup(pg);
      };

      expect(throwsError).toThrow('Cannot delete provisioned object.');
    });

    it('should soft-delete a priority group', () => {
      const onCloseFinishedSubject = new Subject();
      const ngx = TestBed.get(NgxSmartModalService);
      jest.spyOn(ngx, 'getModal').mockImplementation(() => {
        return {
          open: jest.fn(),
          onAnyCloseEvent: of({}),
          onCloseFinished: onCloseFinishedSubject.asObservable(),
        };
      });

      const softDeleteSpy = jest.spyOn(TestBed.get(V1PriorityGroupsService), 'v1PriorityGroupsIdSoftDelete');
      const pg = { id: '1' } as PriorityGroup;
      component.deletePriorityGroup(pg);
      onCloseFinishedSubject.next({
        getData: () => {
          return { modalYes: true };
        },
        removeData: jest.fn(),
      });

      expect(softDeleteSpy).toHaveBeenCalledWith({ id: '1' });
    });

    it('should delete a priority group', () => {
      const ngx = TestBed.get(NgxSmartModalService);
      const onCloseFinishedSubject = new Subject();
      jest.spyOn(ngx, 'getModal').mockImplementation(() => {
        return {
          open: jest.fn(),
          onAnyCloseEvent: of({}),
          onCloseFinished: onCloseFinishedSubject.asObservable(),
        } as any;
      });

      const deleteSpy = jest.spyOn(TestBed.get(V1PriorityGroupsService), 'v1PriorityGroupsIdDelete');
      const pg = { id: '1', deletedAt: {} } as PriorityGroup;
      component.deletePriorityGroup(pg);
      onCloseFinishedSubject.next({
        getData: () => {
          return { modalYes: true };
        },
        removeData: jest.fn(),
      });

      expect(deleteSpy).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('Restoring', () => {
    it('should not restore a priority group when it is not soft-deleted', () => {
      const pg = { id: '1' } as PriorityGroup;
      const restoreSpy = jest.spyOn(TestBed.get(V1PriorityGroupsService), 'v1PriorityGroupsIdRestorePatch');

      component.restorePriorityGroup(pg);
      expect(restoreSpy).not.toHaveBeenCalled();
    });

    it('should restore a soft-deleted priority group', () => {
      const pg = { id: '1', deletedAt: {} } as PriorityGroup;
      const restoreSpy = jest.spyOn(TestBed.get(V1PriorityGroupsService), 'v1PriorityGroupsIdRestorePatch');

      component.restorePriorityGroup(pg);
      expect(restoreSpy).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('Modal', () => {
    it('should open the priority group modal in create mode', () => {
      const setModalDataSpy = jest.spyOn(TestBed.get(NgxSmartModalService), 'setModalData');
      const createButton = fixture.debugElement.query(By.css('.btn-toolbar .btn.btn-success'));
      createButton.nativeElement.click();
      expect(setModalDataSpy).toHaveBeenCalledWith(
        {
          datacenterId: 'datacenterId',
          priorityGroup: undefined,
          modalMode: ModalMode.Create,
        },
        'priorityGroupModal',
      );
    });
  });
});
