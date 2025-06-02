/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbComponent } from './breadcrumb.component';
import { MockComponent } from 'src/test/mock-components';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;
  /* eslint-disable-next-line */
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [BreadcrumbComponent, MockComponent('app-datacenter-select')],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('tests', () => {
    it('should get breadcrumbs on init', () => {
      const getBCSpy = jest.spyOn(component as any, 'getBreadcrumbs');
      component.ngOnInit();
      expect(getBCSpy).toHaveBeenCalledWith(component['route'].root);
    });
  });
});
