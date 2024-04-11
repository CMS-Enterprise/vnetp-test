import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PreviewModalComponent } from './preview-modal.component';
import { MockComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

describe('PreviewModalComponent', () => {
  let component: PreviewModalComponent<any>;
  let fixture: ComponentFixture<PreviewModalComponent<any>>;
  let ngxSmartModalService: NgxSmartModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        PreviewModalComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockNgxSmartModalComponent,
      ],
      imports: [ReactiveFormsModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();

    ngxSmartModalService = TestBed.inject(NgxSmartModalService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewModalComponent);
    component = fixture.componentInstance;

    component.form = new FormGroup({});
    component.config = {
      description: 'Sample Table',
      columns: [],
    };
    component.data = [
      { prop1: 'Value 1A', prop2: 'Value 1B' },
      { prop1: 'Value 2A', prop2: 'Value 2B' },
    ];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should confirm the preview modal and close it', () => {
    const resetModalDataSpy = jest.spyOn(ngxSmartModalService, 'resetModalData');
    const setModalDataSpy = jest.spyOn(ngxSmartModalService, 'setModalData');
    const closeSpy = jest.spyOn(ngxSmartModalService, 'close');

    component.confirm();

    expect(resetModalDataSpy).toHaveBeenCalledWith('previewModal');
    expect(setModalDataSpy).toHaveBeenCalledWith(Object.assign({}, { confirm: true }), 'previewModal');
    expect(closeSpy).toHaveBeenCalledWith('previewModal');
  });

  it('should cancel the preview modal and close it', () => {
    const resetModalDataSpy = jest.spyOn(ngxSmartModalService, 'resetModalData');
    const closeSpy = jest.spyOn(ngxSmartModalService, 'close');

    component.cancel();

    expect(resetModalDataSpy).toHaveBeenCalledWith('previewModal');
    expect(closeSpy).toHaveBeenCalledWith('previewModal');
  });

  it('should retrieve modal data and set component properties', () => {
    const mockModalData = {
      tableConfig: {
        description: 'Sample Table',
        columns: ['prop1', 'prop2'],
      },
      data: [
        { prop1: 'Value 1A', prop2: 'Value 1B' },
        { prop1: 'Value 2A', prop2: 'Value 2B' },
      ],
    };
    jest.spyOn(ngxSmartModalService, 'getModalData').mockReturnValue(mockModalData);
    const resetModalDataSpy = jest.spyOn(ngxSmartModalService, 'resetModalData');

    component.getData();

    expect(component.config.description).toEqual('Sample Table');
    expect(component.config.columns).toEqual(['prop1', 'prop2']);
    expect(component.data).toEqual(mockModalData.data);
    expect(resetModalDataSpy).toHaveBeenCalledWith('previewModal');
  });
});
