/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockNgxSmartModalComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { L3OutsComponent } from './l3-outs.component';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { of, Subject, Subscription } from 'rxjs';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { L3Out, V2AppCentricL3outsService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { L3OutsModalDto } from 'src/app/models/appcentric/l3-outs-model-dto';

describe('L3OutsComponent', () => {
  let component: L3OutsComponent;
  let fixture: ComponentFixture<L3OutsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        L3OutsComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockImportExportComponent,
        MockIconButtonComponent,
        MockComponent({ selector: 'app-l3-outs-modal', inputs: ['l3outs', 'tenantId', 'vrfs'] }),
        MockYesNoModalComponent,
      ],
      imports: [RouterTestingModule, HttpClientModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V2AppCentricL3outsService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(L3OutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('importL3OutsConfig', () => {
    const mockNgxSmartModalComponent = {
      getData: jest.fn().mockReturnValue({ modalYes: true }),
      removeData: jest.fn(),
      onCloseFinished: {
        subscribe: jest.fn(),
      },
    };

    beforeEach(() => {
      component['ngx'] = {
        getModal: jest.fn().mockReturnValue({
          ...mockNgxSmartModalComponent,
          open: jest.fn(),
        }),
        setModalData: jest.fn(),
      } as any;
    });

    it('should display a confirmation modal with the correct message', () => {
      const event = [{ name: 'L3 Out 1' }, { name: 'L3 Out 2' }] as any;
      const modalDto = new YesNoModalDto('Import L3Outs', `Are you sure you would like to import ${event.length} L3 Outs?`);
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importL3Outs(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import l3 outs and refresh the table on confirmation', () => {
      const event = [{ name: 'L3 Out 1' }, { name: 'L3 Out 2' }] as any;
      jest.spyOn(component, 'getL3Outs');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['l3OutService'].createManyL3Out).toHaveBeenCalledWith({
          createManyL3OutDto: { bulk: component.sanitizeData(event) },
        });

        mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
          const data = modal.getData() as YesNoModalDto;
          modal.removeData();
          if (data && data.modalYes) {
            onConfirm();
          }
        });

        return new Subscription();
      });

      component.importL3Outs(event);

      expect(component.getL3Outs).toHaveBeenCalled();
    });
  });

  it('should delete route profile', () => {
    const l3outToDelete = { id: '123', description: 'Bye!' } as L3Out;
    const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
    component.deleteL3Out(l3outToDelete);
    const getAppProfilesMock = jest.spyOn(component['l3OutService'], 'getManyL3Out');
    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(getAppProfilesMock).toHaveBeenCalled();
  });

  it('should restore route profile', () => {
    const l3out = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['l3OutService'], 'restoreOneL3Out').mockReturnValue(of({} as any));
    jest.spyOn(component, 'getL3Outs');
    component.restoreL3Out(l3out);
    expect(component['l3OutService'].restoreOneL3Out).toHaveBeenCalledWith({ id: l3out.id });
    expect(component.getL3Outs).toHaveBeenCalled();
  });

  it('should routely search params when filtered results is true', () => {
    const l3out = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['l3OutService'], 'restoreOneL3Out').mockReturnValue(of({} as any));

    const getAppProfilesSpy = jest.spyOn(component, 'getL3Outs');
    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

    component.restoreL3Out(l3out);

    // expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
    // expect(component.tableComponentDto.searchText).toBe(params.searchText);
    expect(getAppProfilesSpy).toHaveBeenCalledWith(params);
  });

  describe('openL3OutModal', () => {
    describe('openModal', () => {
      beforeEach(() => {
        jest.spyOn(component, 'getL3Outs');
        jest.spyOn(component['ngx'], 'resetModalData');
      });

      it('should subscribe to l3outModal onCloseFinished event and unsubscribe afterwards', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

        const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

        component.subscribeToL3OutsModal();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('l3OutsModal');
        expect(component.l3OutsModalSubscription).toBeDefined();

        onCloseFinished.next();

        expect(component.getL3Outs).toHaveBeenCalled();
        expect(component['ngx'].resetModalData).toHaveBeenCalledWith('l3OutsModal');

        expect(unsubscribeSpy).toHaveBeenCalled();
      });
      it('should call ngx.setModalData and ngx.getModal().open', () => {
        const l3out = { id: 1, name: 'Test App Profile' } as any;
        component.tenantId = { id: '1' } as any;
        component.openL3OutsModal(ModalMode.Edit, l3out);

        expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(L3OutsModalDto), 'l3OutsModal');
        expect(component['ngx'].getModal).toHaveBeenCalledWith('l3OutsModal');

        const modal = component['ngx'].getModal('l3OutsModal');
        expect(modal).toBeDefined();
      });
    });
  });
});
