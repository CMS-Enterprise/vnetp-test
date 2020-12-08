import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BreadcrumbComponent } from './breadcrumb.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'src/test/mock-components';
import { ActivatedRoute, Router, NavigationEnd, PRIMARY_OUTLET, Event } from '@angular/router';
import { Subject } from 'rxjs';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;

  const eventSubject = new Subject<Event>();

  beforeEach(async(() => {
    const activatedRoute = {
      root: {
        children: [],
      },
    };

    const router = {
      events: eventSubject.asObservable(),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [BreadcrumbComponent, MockComponent('app-datacenter-select')],
      providers: [
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(BreadcrumbComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  const createRoute = (breadcrumb: string, url: { path: string }[]): any => {
    return {
      children: [],
      outlet: PRIMARY_OUTLET,
      snapshot: {
        data: {
          breadcrumb,
        },
        url,
      },
    };
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a list of breadcrumbs', () => {
    const activatedRoute = TestBed.inject(ActivatedRoute) as any;
    activatedRoute.root = {
      children: [createRoute('Example Breadcrumb', [{ path: 'path' }, { path: 'to' }, { path: 'page' }])],
    };
    eventSubject.next(new NavigationEnd(1, '', ''));

    const labels = component.breadcrumbs.map(b => b.label);
    const urls = component.breadcrumbs.map(b => b.url);
    expect(labels).toEqual(['Dashboard', 'Example Breadcrumb']);
    expect(urls).toEqual(['/dashboard', '/path/to/page']);
  });

  it('should create a single breadcrumb for the dashboard', () => {
    const activatedRoute = TestBed.inject(ActivatedRoute) as any;
    activatedRoute.root = {
      children: [],
    };
    eventSubject.next(new NavigationEnd(1, '', ''));

    const labels = component.breadcrumbs.map(b => b.label);
    const urls = component.breadcrumbs.map(b => b.url);
    expect(labels).toEqual(['Dashboard']);
    expect(urls).toEqual(['/dashboard']);
  });

  it('should not include children with a non-primary outlet', () => {
    const childRoute = createRoute('Non-Primary', [{ path: 'hello' }]);
    childRoute.outlet = null;
    const activatedRoute = TestBed.inject(ActivatedRoute) as any;
    activatedRoute.root = {
      children: [childRoute],
    };
    eventSubject.next(new NavigationEnd(1, '', ''));

    expect(component.breadcrumbs.length).toBe(1);
  });

  it('should not include children without a url', () => {
    const childRoute = createRoute('Primary', []);
    const activatedRoute = TestBed.inject(ActivatedRoute) as any;
    activatedRoute.root = {
      children: [childRoute],
    };
    eventSubject.next(new NavigationEnd(1, '', ''));

    expect(component.breadcrumbs.length).toBe(1);
  });

  it('should not include children without a breadcrumb property', () => {
    const childRoute = createRoute('Primary', [{ path: 'hello' }]);
    childRoute.snapshot.data = {};
    const activatedRoute = TestBed.inject(ActivatedRoute) as any;
    activatedRoute.root = {
      children: [childRoute],
    };
    eventSubject.next(new NavigationEnd(1, '', ''));

    expect(component.breadcrumbs.length).toBe(1);
  });

  it('should include nested child routes', () => {
    const childRoute = createRoute('1', [{ path: '1' }]);
    const grandchildRoute = createRoute('2', [{ path: '2' }]);
    childRoute.children = [grandchildRoute];

    const activatedRoute = TestBed.inject(ActivatedRoute) as any;
    activatedRoute.root = {
      children: [childRoute],
    };
    eventSubject.next(new NavigationEnd(1, '', ''));

    const labels = component.breadcrumbs.map(b => b.label);
    expect(labels).toEqual(['Dashboard', '1', '2']);
  });
});
