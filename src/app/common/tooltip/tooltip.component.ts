import { Component, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'tooltip',
  templateUrl: 'tooltip.component.html',
  styleUrls: ['tooltip.component.scss'],
  standalone: false,
})
export class TooltipComponent {
  @Input() message: string;
  @ViewChild('tooltip', { static: true }) public tooltip: ElementRef;

  public tooltipMsgStyle: Partial<CSSStyleDeclaration>;
  public isShowTooltip = false;
  public isLockTooltip = false;

  public showTooltip(shouldShow: boolean): void {
    this.isShowTooltip = shouldShow;

    const screenW = document.body.clientWidth;
    const screenH = document.body.clientHeight;
    const posX = this.tooltip.nativeElement.getBoundingClientRect().left;
    const posY = this.tooltip.nativeElement.getBoundingClientRect().bottom;
    const dynamicWidth = this.message.length * 8.5;
    const tooltipHeight = this.tooltip.nativeElement.scrollHeight;

    if (tooltipHeight > 200) {
      this.tooltip.nativeElement.lastElementChild.id = 'adjustme';
    } else if (posY / screenH > 0.85) {
      this.tooltip.nativeElement.lastElementChild.id = 'raised-tooltip';
    }

    if (this.message.length <= 40) {
      if (posX / screenW <= 0.6) {
        this.tooltipMsgStyle = {
          left: '0',
          maxWidth: dynamicWidth + 'px',
        };
      } else {
        this.tooltipMsgStyle = {
          right: '8px',
          maxWidth: dynamicWidth + 'px',
        };
      }
    } else if (this.message.length > 750) {
      if (posX / screenW <= 0.6) {
        this.tooltipMsgStyle = {
          left: '0px',
          maxWidth: '600px',
          top: '-20px',
        };
      } else {
        this.tooltipMsgStyle = {
          right: '8px',
          maxWidth: '600px',
          top: '-20px',
        };
      }
    } else {
      if (posX / screenW <= 0.52) {
        this.tooltipMsgStyle = { left: '0px' };
      } else if (posX / screenW <= 0.63) {
        this.tooltipMsgStyle = { left: '0px', maxWidth: '270px' };
      } else {
        this.tooltipMsgStyle = { right: '8px' };
      }
    }
  }

  public toggleVisiblity(): void {
    this.isLockTooltip = !this.isLockTooltip;
    if (this.isLockTooltip === false) {
      this.isShowTooltip = false;
    }
  }
}
