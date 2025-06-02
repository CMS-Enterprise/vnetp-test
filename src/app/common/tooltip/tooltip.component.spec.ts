import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipComponent } from './tooltip.component';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { By } from '@angular/platform-browser';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TooltipComponent, MockFontAwesomeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('showTooltip', () => {
    it('should set tooltipMsgStyle based on message length and tooltip position (1)', () => {
      component.message = 'A'.repeat(20);

      const tooltipElement = fixture.debugElement.query(By.css('.tooltip')).nativeElement;
      jest.spyOn(tooltipElement, 'getBoundingClientRect').mockReturnValue({ left: 100, bottom: 200 });

      Object.defineProperty(document.body, 'clientWidth', { value: 1200, configurable: true });
      Object.defineProperty(document.body, 'clientHeight', { value: 800 });

      component.showTooltip(true);

      expect(component.tooltipMsgStyle).toEqual({ left: '0', maxWidth: '170px' });
    });

    it('should set tooltipMsgStyle based on message length and tooltip position (2)', () => {
      component.message = 'A'.repeat(20);

      const tooltipElement = fixture.debugElement.query(By.css('.tooltip')).nativeElement;
      jest.spyOn(tooltipElement, 'getBoundingClientRect').mockReturnValue({ left: 900, bottom: 200 });

      Object.defineProperty(document.body, 'clientWidth', { value: 1200, configurable: true });
      Object.defineProperty(document.body, 'clientHeight', { value: 800 });

      component.showTooltip(true);

      expect(component.tooltipMsgStyle).toEqual({
        maxWidth: '170px',
        right: '8px',
      });
    });

    it('should set tooltipMsgStyle based on message length and tooltip position (3)', () => {
      component.message = 'A'.repeat(800);

      jest.spyOn(component.tooltip.nativeElement, 'getBoundingClientRect').mockReturnValue({ left: 100, bottom: 200 });

      component.showTooltip(true);
      expect(component.tooltipMsgStyle).toEqual({ left: '0px', maxWidth: '600px', top: '-20px' });
    });

    it('should set tooltipMsgStyle based on message length and tooltip position (4)', () => {
      component.message = 'A'.repeat(800);

      const tooltipElement = fixture.debugElement.query(By.css('.tooltip')).nativeElement;
      jest.spyOn(tooltipElement, 'getBoundingClientRect').mockReturnValue({ left: 100, bottom: 200 });

      Object.defineProperty(document.body, 'clientWidth', { value: 1200, configurable: true });
      Object.defineProperty(document.body, 'clientHeight', { value: 800 });

      component.showTooltip(true);

      expect(component.tooltipMsgStyle).toEqual({
        maxWidth: '600px',
        top: '-20px',
        left: '0px',
      });
    });

    it('should set tooltipMsgStyle based on message length and tooltip position (5)', () => {
      component.message = 'A'.repeat(100);

      jest.spyOn(component.tooltip.nativeElement, 'getBoundingClientRect').mockReturnValue({ left: 100, bottom: 200 });

      component.showTooltip(true);
      expect(component.tooltipMsgStyle).toEqual({ left: '0px' });
    });

    it('should set tooltipMsgStyle based on message length and tooltip position (6)', () => {
      component.message = 'A'.repeat(750);

      const tooltipElement = fixture.debugElement.query(By.css('.tooltip')).nativeElement;
      jest.spyOn(tooltipElement, 'getBoundingClientRect').mockReturnValue({ left: 100, bottom: 200 });

      Object.defineProperty(document.body, 'clientWidth', { value: 1200, configurable: true });
      Object.defineProperty(document.body, 'clientHeight', { value: 800 });

      component.showTooltip(true);

      expect(component.tooltipMsgStyle).toEqual({
        left: '0px',
      });
    });
  });

  describe('this', () => {
    it('should set tooltipMsgStyle based on message length and tooltip position - new test', () => {
      component.message = 'A'.repeat(700);
      Object.defineProperty(document.body, 'clientWidth', { value: 500, configurable: true });

      jest.spyOn(component.tooltip.nativeElement, 'getBoundingClientRect').mockReturnValue({ left: 100 });

      component.showTooltip(true);
      expect(component.tooltipMsgStyle).toEqual({ left: '0px' });
    });

    it('should set tooltipMsgStyle based on message length and tooltip position - new test', () => {
      component.message = 'A'.repeat(700);
      Object.defineProperty(document.body, 'clientWidth', { value: 200, configurable: true });

      jest.spyOn(component.tooltip.nativeElement, 'getBoundingClientRect').mockReturnValue({ left: 100 });

      component.showTooltip(true);
      expect(component.tooltipMsgStyle).toEqual({ left: '0px' });
    });
  });

  describe('toggleVisiblity', () => {
    it('should toggle isLockTooltip and hide tooltip when unlocking', () => {
      component.isLockTooltip = false;
      component.isShowTooltip = true;
    });
  });
});
