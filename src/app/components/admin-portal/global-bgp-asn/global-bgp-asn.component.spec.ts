import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalBgpAsnComponent } from './global-bgp-asn.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('GlobalBgpAsnComponent', () => {
  let component: GlobalBgpAsnComponent;
  let fixture: ComponentFixture<GlobalBgpAsnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlobalBgpAsnComponent],
      imports: [],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalBgpAsnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and ranges link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h1 = compiled.querySelector('h1');
    expect(h1?.textContent?.trim()).toBe('Global BGP ASN');

    const link = compiled.querySelector('a.tab');
    expect(link?.textContent?.trim()).toBe('Ranges');
  });

  it('should contain a router-outlet placeholder', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Router outlet renders as <router-outlet>
    const outlet = compiled.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });
});
