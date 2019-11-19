import { Component, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'tooltip',
  templateUrl: 'tooltip.component.html',
  styleUrls: ['tooltip.component.scss'],
})
export class TooltipComponent {
  @Input() message: string;
  @ViewChild('tooltip') private tooltip: ElementRef;

  public tooltipMsgStyle: any;
  public isShowTooltip = false;
  public isLockTooltip = false;

  constructor() {}

  showTooltip($event) {
    this.isShowTooltip = $event;

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
          left: '0px',
          'max-width': dynamicWidth + 'px',
        };
      } else {
        this.tooltipMsgStyle = {
          right: '8px',
          'max-width': dynamicWidth + 'px',
        };
      }
    } else if (this.message.length > 750) {
      if (posX / screenW <= 0.6) {
        this.tooltipMsgStyle = {
          left: '0px',
          'max-width': '600px',
          top: '-20px',
        };
      } else {
        this.tooltipMsgStyle = {
          right: '8px',
          'max-width': '600px',
          top: '-20px',
        };
      }
    } else {
      if (posX / screenW <= 0.52) {
        this.tooltipMsgStyle = { left: '0px' };
      } else if (posX / screenW <= 0.63) {
        this.tooltipMsgStyle = { left: '0px', 'max-width': '270px' };
      } else {
        this.tooltipMsgStyle = { right: '8px' };
      }
    }
  }

  toggleVis() {
    this.isLockTooltip = !this.isLockTooltip;
    if (this.isLockTooltip === false) {
      this.isShowTooltip = false;
    }
  }
}
