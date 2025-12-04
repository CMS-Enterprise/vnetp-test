/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BugsEnhancementsComponent } from './bugs-enhancements.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { V1MailService } from 'client';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from 'src/test/mock-providers';
import { of, Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

describe('BugsEnhancementsComponent', () => {
  let component: BugsEnhancementsComponent;
  let fixture: ComponentFixture<BugsEnhancementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([]), NgxPaginationModule, FormsModule, ReactiveFormsModule],
      declarations: [
        MockComponent({ selector: 'app-bugs-enhancements-view-modal', inputs: ['mail'] }),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        BugsEnhancementsComponent,
        YesNoModalComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1MailService)],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BugsEnhancementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getMails on table event', () => {
    jest.spyOn(component, 'getMails');
    component.onTableEvent({} as any);
    expect(component.getMails).toHaveBeenCalled();
  });

  it('should get mails', () => {
    jest.spyOn(component['mailService'], 'getMailsMail').mockReturnValue(of({} as any));
    component.getMails({ page: 1, perPage: 20 });
    expect(component['mailService'].getMailsMail).toHaveBeenCalled();
  });

  it('should apply search params when filtered results is true', () => {
    const mail = { id: '1' } as any;
    jest.spyOn(component['mailService'], 'deleteMailMail').mockResolvedValue({} as never);

    jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
      options.onSuccess();
      return new Subscription();
    });

    const params = { searchString: '', filteredResults: true, searchColumn: '', searchText: '' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);
    const getMailsSpy = jest.spyOn(component, 'getMails');

    component.deleteMail(mail);

    expect(getMailsSpy).toHaveBeenCalledWith(component.tableComponentDto);
  });

  it('should delete mail', () => {
    const mailToDelete = { id: 1, status: 'Open' };
    const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
    const params = { filteredResults: true } as any;
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);
    const getMailsMock = jest.spyOn(component['mailService'], 'getMailsMail');
    component.deleteMail(mailToDelete);
    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(getMailsMock).toHaveBeenCalled();
  });

  describe('openModal', () => {
    it('should call ngx.setModalData and ngx.getModal().open', () => {
      const mail = { id: 1 } as any;
      component.openDetailedModal(mail);
      expect(component['ngx'].getModal).toHaveBeenCalledWith('bugsEnhancementsViewModal');
      const modal = component['ngx'].getModal('bugsEnhancementsViewModal');
      expect(modal).toBeDefined();
    });
  });
});
