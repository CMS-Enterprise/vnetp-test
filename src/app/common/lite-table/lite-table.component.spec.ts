import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiteTableComponent } from './lite-table.component';

describe('LiteTableComponent', () => {
  let component: LiteTableComponent;
  let fixture: ComponentFixture<LiteTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LiteTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LiteTableComponent);
    component = fixture.componentInstance;
    component.config = {
      columns: [],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewChecked', () => {
    it('should call config.afterView if it exists', () => {
      const afterViewSpy = jest.fn();
      component.config.afterView = afterViewSpy;
      component.ngAfterViewChecked();
      expect(afterViewSpy).toHaveBeenCalled();
    });

    it('should not call config.afterView if it does not exist', () => {
      const afterViewSpy = jest.fn();
      component.config.afterView = undefined;
      component.ngAfterViewChecked();
      expect(afterViewSpy).not.toHaveBeenCalled();
    });
  });
});
