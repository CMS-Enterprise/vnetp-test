import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatacenterSelectComponent } from './datacenter-select.component';
import { FormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastrService } from 'ngx-toastr';
import { MockNgxSmartModalComponent, MockTooltipComponent } from 'src/test/mock-components';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { By } from '@angular/platform-browser';
import { MockProvider } from 'src/test/mock-providers';
import { RouterTestingModule } from '@angular/router/testing';

describe('DatacenterSelectComponent', () => {
  let component: DatacenterSelectComponent;
  let fixture: ComponentFixture<DatacenterSelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule.withRoutes([])],
      declarations: [DatacenterSelectComponent, MockNgxSmartModalComponent, MockTooltipComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(ToastrService), MockProvider(DatacenterContextService)],
    });

    fixture = TestBed.createComponent(DatacenterSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should call to open the datacenter switch modal on click', () => {
  //   const ngx = TestBed.inject(NgxSmartModalService) as any;
  //   const openSpy = jest.fn();
  //   console.log('openSpy',openSpy.mock)
  //   jest.spyOn(ngx, 'getModal').mockImplementation(() => {
  //     return {
  //       open: openSpy,
  //     };
  //   });

  //   const openButton = fixture.debugElement.query(By.css('.btn.btn-primary'));
  //   openButton.nativeElement.click();

  //   expect(openSpy).toHaveBeenCalled();
  // });

  describe('switchDatacenter', () => {
    it('should call to switch the datacenter', () => {
      const datacenterContextService = TestBed.inject(DatacenterContextService);
      const spy = jest.spyOn(datacenterContextService, 'switchDatacenter');

      component.selectedDatacenter = {
        id: '2',
        name: 'Datacenter2',
      };
      component.switchDatacenter();

      expect(spy).toHaveBeenCalledWith('2');
    });

    it('should display a toastr success message when changing datacenters succeeds', () => {
      const datacenterContextService = TestBed.inject(DatacenterContextService);
      jest.spyOn(datacenterContextService, 'switchDatacenter').mockImplementation(() => true);
      const toastrService = TestBed.inject(ToastrService);
      const successSpy = jest.spyOn(toastrService, 'success');

      component.selectedDatacenter = {
        id: '2',
        name: 'Datacenter2',
      };
      component.switchDatacenter();

      expect(successSpy).toHaveBeenCalledWith('Datacenter switched');
    });

    it('should display a toastr error message when changing datacenters fails', () => {
      const toastrService = TestBed.inject(ToastrService);
      const datacenterContextService = TestBed.inject(DatacenterContextService);

      const errorSpy = jest.spyOn(toastrService, 'error');
      jest.spyOn(datacenterContextService, 'switchDatacenter').mockImplementation(() => false);

      component.selectedDatacenter = {
        id: '2',
        name: 'Datacenter2',
      };
      component.switchDatacenter();

      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
