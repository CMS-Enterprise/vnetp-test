import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DatacenterSelectComponent } from './datacenter-select.component';
import { FormsModule } from '@angular/forms';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';
import { MockNgxSmartModalComponent } from 'src/test/mock-components';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { By } from '@angular/platform-browser';

describe('DatacenterSelectComponent', () => {
  let component: DatacenterSelectComponent;
  let fixture: ComponentFixture<DatacenterSelectComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    const toastrService = {
      success: jest.fn(),
      error: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [DatacenterSelectComponent, MockNgxSmartModalComponent],
      providers: [CookieService, { provide: NgxSmartModalService, useValue: ngx }, { provide: ToastrService, useValue: toastrService }],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(DatacenterSelectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call to open the datacenter switch modal on click', () => {
    const modal = ngx.getModal('test');
    const spy = jest.spyOn(ngx, 'getModal').mockImplementation(() => {
      return {
        ...modal,
        open: jest.fn(),
      };
    });

    const openButton = fixture.debugElement.query(By.css('.btn.btn-primary'));
    openButton.nativeElement.click();

    expect(spy).toHaveBeenCalledWith('datacenterSwitchModal');

    const getModalCall = spy.mock.results[0].value;
    expect(getModalCall.open).toHaveBeenCalled();
  });

  describe('switchDatacenter', () => {
    it('should call to switch the datacenter', () => {
      const datacenterContextService = TestBed.get(DatacenterContextService);
      const spy = jest.spyOn(datacenterContextService, 'switchDatacenter');

      component.selectedDatacenter = {
        id: '2',
        name: 'Datacenter2',
      };
      component.switchDatacenter();

      expect(spy).toHaveBeenCalledWith('2');
    });

    it('should display a toastr success message when changing datacenters succeeds', () => {
      const toastrService = TestBed.get(ToastrService);
      const successSpy = jest.spyOn(toastrService, 'success');

      component.selectedDatacenter = {
        id: '2',
        name: 'Datacenter2',
      };
      component.switchDatacenter();

      expect(successSpy).toHaveBeenCalledWith('Datacenter Switched');
    });

    it('shoud display a toastr error message when changing datacenters fails', () => {
      const toastrService = TestBed.get(ToastrService);
      const datacenterContextService = TestBed.get(DatacenterContextService);

      const errorSpy = jest.spyOn(toastrService, 'error');
      jest.spyOn(datacenterContextService, 'switchDatacenter').mockImplementation(() => {
        throw Error();
      });

      component.selectedDatacenter = {
        id: '2',
        name: 'Datacenter2',
      };
      component.switchDatacenter();

      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
