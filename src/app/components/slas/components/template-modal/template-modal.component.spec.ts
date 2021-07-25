import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { ActifioPolicyDtoOperationEnum, V1ActifioGmTemplatesService } from 'client';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockProvider } from 'src/test/mock-providers';
import { ToastrService } from 'ngx-toastr';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TemplateModalComponent } from './template-modal.component';
import { By } from '@angular/platform-browser';

describe('TemplateModalComponent', () => {
  let component: TemplateModalComponent;
  let fixture: ComponentFixture<TemplateModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [MockNgxSmartModalComponent, MockFontAwesomeComponent, TemplateModalComponent],
      providers: [MockProvider(V1ActifioGmTemplatesService), MockProvider(NgxSmartModalService), MockProvider(ToastrService)],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TemplateModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default the time window when creating a new template', () => {
    const ngx = TestBed.inject(NgxSmartModalService);
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => of({}));

    component.onLoad();

    const { startTime, endTime } = component.form.controls;
    expect(startTime.value).toBe('00:00');
    expect(endTime.value).toBe('23:00');
  });

  it('should not set the time window when the template does not have a snapshot policy', () => {
    const ngx = TestBed.inject(NgxSmartModalService);
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      return {
        id: '1',
        name: 'Name',
      };
    });
    const templateService = TestBed.inject(V1ActifioGmTemplatesService) as any;
    templateService.getTemplatePoliciesActifioTemplate = jest.fn(() => of([]));

    component.onLoad();

    const { startTime, endTime } = component.form.controls;
    expect(startTime.value).toBe(null);
    expect(endTime.value).toBe(null);
  });

  it('should set the time window when editing a template', () => {
    const ngx = TestBed.inject(NgxSmartModalService);
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      return {
        id: '1',
        name: 'Name',
      };
    });
    const templateService = TestBed.inject(V1ActifioGmTemplatesService) as any;
    templateService.getTemplatePoliciesActifioTemplate = jest.fn(() => {
      return of([{ startTime: 1 * 60 * 60, endTime: 2 * 60 * 60 }]);
    });

    component.onLoad();

    const { startTime, endTime } = component.form.controls;
    expect(startTime.value).toBe('01:00');
    expect(endTime.value).toBe('02:00');
  });

  it('should save a new template', () => {
    component.isNewTemplate = true;
    component.form.controls.name.setValue('Name');
    component.form.controls.description.setValue('Description');
    component.form.controls.startTime.setValue('00:00');
    component.form.controls.endTime.setValue('10:00');

    const templateService = TestBed.inject(V1ActifioGmTemplatesService);
    const saveSpy = jest.spyOn(templateService, 'createTemplateActifioTemplate');

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(saveSpy).toHaveBeenCalledWith({
      actifioAddTemplateDto: {
        name: 'Name',
        description: 'Description',
        policies: [
          {
            name: 'S-Daily',
            operation: ActifioPolicyDtoOperationEnum.Snap,
            isWindowed: true,
            startTime: 0,
            endTime: 10 * 60 * 60,
          },
        ],
      },
    });
  });

  it('should not save the template when the name is empty', () => {
    const templateService = TestBed.inject(V1ActifioGmTemplatesService);
    const saveSpy = jest.spyOn(templateService, 'createTemplateActifioTemplate');

    component.form.controls.name.setValue('');

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(saveSpy).not.toHaveBeenCalled();
  });
});
