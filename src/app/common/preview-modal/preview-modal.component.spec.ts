import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgxSmartModalServiceStub } from 'src/test/modal-mock';
import { By } from '@angular/platform-browser';
import { PreviewModalComponent } from './preview-modal.component';

describe('PreviewModalComponent', () => {
  let component: PreviewModalComponent;
  let fixture: ComponentFixture<PreviewModalComponent>;

  beforeEach(async(() => {
    const ngx = new NgxSmartModalServiceStub();

    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [PreviewModalComponent, MockNgxSmartModalComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(PreviewModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('yes', () => {
    const clickConfirmButton = () => fixture.debugElement.query(By.css('.btn.btn-primary')).nativeElement.click();

    it('should set modal confirm to true when clicked', () => {
      const service = TestBed.get(NgxSmartModalService);
      const setModalSpy = jest.spyOn(service, 'setModalData');

      clickConfirmButton();

      expect(setModalSpy).toHaveBeenCalledWith(
        {
          confirm: true,
        },
        'previewModal',
      );
    });

    it('should set all tier selected to true when clicked', () => {
      const service = TestBed.get(NgxSmartModalService);
      const setModalSpy = jest.spyOn(service, 'setModalData');

      clickConfirmButton();

      expect(setModalSpy).toHaveBeenCalledWith(
        {
          confirm: true,
        },
        'previewModal',
      );
    });
  });

  describe('cancel', () => {
    const clickNoButton = () => fixture.debugElement.query(By.css('.btn.btn-link')).nativeElement.click();

    it('should close and reset the modal when clicked', () => {
      const service = TestBed.get(NgxSmartModalService);

      const resetSpy = jest.spyOn(service, 'resetModalData');
      const closeSpy = jest.spyOn(service, 'close');

      clickNoButton();

      expect(resetSpy).toHaveBeenCalledWith('previewModal');
      expect(closeSpy).toHaveBeenCalledWith('previewModal');
    });
  });

  describe('getData', () => {
    it('should update the modal title', () => {
      const service = TestBed.get(NgxSmartModalService);

      jest.spyOn(service, 'getModalData').mockImplementation(() => {
        return {
          title: 'Title',
          headers: ['fake header', 'second fake header'],
          toBeDeleted: [],
          toBeAdded: [],
        };
      });

      component.getData();
      fixture.detectChanges();

      const modalTitle = fixture.debugElement.query(By.css('.modal-title'));
      expect(modalTitle.nativeElement.innerHTML.trim()).toBe('Title');
    });
  });
});
