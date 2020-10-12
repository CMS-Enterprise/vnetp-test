import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { By } from '@angular/platform-browser';
import { IconButtonComponent } from './icon-button.component';

describe('IconButtonComponent', () => {
  let component: IconButtonComponent;
  let fixture: ComponentFixture<IconButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IconButtonComponent, MockFontAwesomeComponent],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(IconButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit an event when the icon is clicked', () => {
    const eventSpy = jest.spyOn(component.handleClick, 'emit');

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    expect(eventSpy).toHaveBeenCalled();
  });
});
