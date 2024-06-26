import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { MockComponent } from 'src/test/mock-components';
import { Subject, of } from 'rxjs';
import { ActivatedRoute, Router, Event, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  const routerEvents = new Subject<Event>();

  beforeEach(() => {
    const activatedRoute = { data: of({ title: 'test' }), outlet: 'primary' };

    const router = {
      events: routerEvents.asObservable(),
    };

    const title = {
      setTitle: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent, MockComponent('app-breadcrumb'), MockComponent('app-navbar')],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: Router, useValue: router },
        { provide: Title, useValue: title },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call to set the title when the route changes', () => {
    const title = TestBed.inject(Title);
    const spy = jest.spyOn(title, 'setTitle');

    const activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.data = of({ title: 'New Title' });

    const navigationEnd = new NavigationEnd(1, '', '');
    routerEvents.next(navigationEnd);

    expect(spy).toHaveBeenCalledWith('New Title');
  });

  it('should default the title to "vNETP"', () => {
    const title = TestBed.inject(Title);
    const spy = jest.spyOn(title, 'setTitle');

    const activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.data = of({ title: null });

    const navigationEnd = new NavigationEnd(1, '', '');
    routerEvents.next(navigationEnd);

    expect(spy).toHaveBeenCalledWith('vNETP');
  });

  it('should get the most child route to set the title', () => {
    const title = TestBed.inject(Title);
    const spy = jest.spyOn(title, 'setTitle');

    const activatedRoute = TestBed.inject(ActivatedRoute) as any;
    activatedRoute.firstChild = { outlet: 'primary', data: of({ title: 'Child Title' }) };
    activatedRoute.data = of({ title: 'Parent Title' });

    const navigationEnd = new NavigationEnd(1, '', '');
    routerEvents.next(navigationEnd);

    expect(spy).toHaveBeenCalledWith('Child Title');
  });
});
