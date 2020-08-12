import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockProvider } from 'src/test/mock-providers';
import { By } from '@angular/platform-browser';
import { YesNoModalComponent } from './yes-no-modal.component';

describe('YesNoModalComponent', () => {
  let component: YesNoModalComponent;
  let fixture: ComponentFixture<YesNoModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [YesNoModalComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService)],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(YesNoModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('yes', () => {
    const clickYesButton = () => fixture.debugElement.query(By.css('.btn.btn-primary')).nativeElement.click();

    it('should set modal yes to "true" when clicked', () => {
      const service = TestBed.get(NgxSmartModalService);
      const setModalSpy = jest.spyOn(service, 'setModalData');

      component.allowEmptyTier = false;

      clickYesButton();

      expect(setModalSpy).toHaveBeenCalledWith(
        {
          modalYes: true,
        },
        'yesNoModal',
      );
    });

    it('should set all tier selected to true when clicked', () => {
      const service = TestBed.get(NgxSmartModalService);
      const setModalSpy = jest.spyOn(service, 'setModalData');

      component.allowEmptyTier = true;
      component.allowEmptyTierRadio = true;

      clickYesButton();

      expect(setModalSpy).toHaveBeenCalledWith(
        {
          modalYes: true,
          allowTierChecked: true,
        },
        'yesNoModal',
      );
    });
  });

  describe('no', () => {
    const clickNoButton = () => fixture.debugElement.query(By.css('.btn.btn-link')).nativeElement.click();

    it('should close and reset the modal when clicked', () => {
      const service = TestBed.get(NgxSmartModalService);

      const resetSpy = jest.spyOn(service, 'resetModalData');
      const closeSpy = jest.spyOn(service, 'close');

      clickNoButton();

      expect(resetSpy).toHaveBeenCalledWith('yesNoModal');
      expect(closeSpy).toHaveBeenCalledWith('yesNoModal');
    });
  });

  describe('getData', () => {
    it('should default the modal title to "Title"', () => {
      const service = TestBed.get(NgxSmartModalService);

      jest.spyOn(service, 'getModalData').mockImplementation(() => {
        return {};
      });

      component.getData();
      fixture.detectChanges();

      const modalTitle = fixture.debugElement.query(By.css('.modal-title'));
      expect(modalTitle.nativeElement.innerHTML).toBe('Title');

      const modalBody = fixture.debugElement.query(By.css('.modal-body'));
      expect(modalBody.nativeElement.innerHTML.trim()).toBe('');
    });

    it('should update the modal title and body', () => {
      const service = TestBed.get(NgxSmartModalService);

      jest.spyOn(service, 'getModalData').mockImplementation(() => {
        return {
          modalTitle: 'Custom Title',
          modalBody: 'Custom Body',
        };
      });

      component.getData();
      fixture.detectChanges();

      const modalTitle = fixture.debugElement.query(By.css('.modal-title'));
      expect(modalTitle.nativeElement.innerHTML.trim()).toBe('Custom Title');

      const modalBody = fixture.debugElement.query(By.css('.modal-body'));
      expect(modalBody.nativeElement.innerHTML.trim()).toBe('Custom Body');
    });
  });
});
