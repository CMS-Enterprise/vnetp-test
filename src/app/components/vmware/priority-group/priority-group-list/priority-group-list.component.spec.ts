import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { PriorityGroupListComponent } from './priority-group-list.component';
import { V1PriorityGroupsService, PriorityGroup, V1DatacentersService } from 'api_client';
import { NgxPaginationModule } from 'ngx-pagination';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { MockProvider } from 'src/test/mock-providers';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EntityService } from 'src/app/services/entity.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('PriorityGroupListComponent', () => {
  let component: PriorityGroupListComponent;
  let fixture: ComponentFixture<PriorityGroupListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgxPaginationModule, RouterTestingModule.withRoutes([])],
      declarations: [
        MockComponent('app-priority-group-modal'),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        PriorityGroupListComponent,
        YesNoModalComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1PriorityGroupsService),
        MockProvider(V1DatacentersService),
        MockProvider(EntityService),
      ],
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

  it('should delete a priority group', () => {
    const entityService = TestBed.inject(EntityService);
    const deleteSpy = jest.spyOn(entityService, 'deleteEntity');

    const pg = { id: '1', deletedAt: {} } as PriorityGroup;
    component.deletePriorityGroup(pg);

    expect(deleteSpy).toHaveBeenCalled();
  });

  describe('Restoring', () => {
    it('should not restore a priority group when it is not soft-deleted', () => {
      const pg = { id: '1' } as PriorityGroup;
      const restoreSpy = jest.spyOn(TestBed.inject(V1PriorityGroupsService), 'v1PriorityGroupsIdRestorePatch');

      component.restorePriorityGroup(pg);
      expect(restoreSpy).not.toHaveBeenCalled();
    });

    it('should restore a soft-deleted priority group', () => {
      const pg = { id: '1', deletedAt: {} } as PriorityGroup;
      const restoreSpy = jest.spyOn(TestBed.inject(V1PriorityGroupsService), 'v1PriorityGroupsIdRestorePatch');

      component.restorePriorityGroup(pg);
      expect(restoreSpy).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('Modal', () => {
    it('should open the priority group modal in create mode', () => {
      const setModalDataSpy = jest.spyOn(TestBed.inject(NgxSmartModalService), 'setModalData');
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
