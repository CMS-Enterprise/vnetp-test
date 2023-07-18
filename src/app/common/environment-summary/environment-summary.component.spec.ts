/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnvironmentSummaryComponent } from './environment-summary.component';
import { MockComponent, MockFontAwesomeComponent } from 'src/test/mock-components';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';

describe('NetworkSummaryComponent', () => {
  let component: EnvironmentSummaryComponent;
  let fixture: ComponentFixture<EnvironmentSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        EnvironmentSummaryComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
      ],
      imports: [RouterTestingModule, HttpClientModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvironmentSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get get tenants on table event', () => {
    spyOn(component, 'getTenants');
    component.onTableEvent({ type: 'onSearch' } as any);
    expect(component.getTenants).toHaveBeenCalled();
  });

  it('should get all tenants and set to table data', () => {
    jest
      .spyOn(component['tenantService'], 'findAllTenant')
      .mockReturnValue(of({ data: [{ name: 'test-name', description: 'test-description', id: 'test-id' }] } as any));
    component.getTenants();
    expect(component.tableData).toEqual([{ name: 'test-name', description: 'test-description', id: 'test-id', type: 'Appcentric' }]);
  });

  it('should switch datacenter and route', () => {
    jest.spyOn(component['datacenterContextService'], 'switchDatacenter');
    jest.spyOn(component['router'], 'navigate');
    component.switchDatacenter('test-datacenter');
    expect(component['datacenterContextService'].switchDatacenter).toHaveBeenCalledWith('test-datacenter');
    expect(component['router'].navigate).toHaveBeenCalled();
  });
});
