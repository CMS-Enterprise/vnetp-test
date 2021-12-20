import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StaticRoutesComponent } from './static-routes.component';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from 'src/test/mock-providers';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1TiersService } from 'client';

describe('StaticRoutesComponent', () => {
  let component: StaticRoutesComponent;
  let fixture: ComponentFixture<StaticRoutesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [StaticRoutesComponent, MockFontAwesomeComponent],
      providers: [MockProvider(DatacenterContextService), MockProvider(V1TiersService)],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticRoutesComponent);
    component = fixture.componentInstance;
    component.DatacenterId = '1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tiers', () => {
    const tierService = TestBed.inject(V1TiersService);
    const loadTiersSpy = jest.spyOn(tierService, 'getManyTier');
    component.getTiers();

    expect(loadTiersSpy).toHaveBeenCalledWith({
      filter: ['datacenterId||eq||1'],
      join: ['staticRoutes'],
    });
  });
});
