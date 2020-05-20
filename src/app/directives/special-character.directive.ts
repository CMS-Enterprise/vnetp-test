import { Directive, HostListener, ElementRef, Input } from '@angular/core';
@Directive({
  selector: '[appIsAlphanumeric]',
})
export class SpecialCharacterDirective {
  regexStr = '^[a-zA-Z0-9_ ]*$';
  @Input() isAlphaNumeric: boolean;

  constructor(private el: ElementRef) {}

  @HostListener('keypress', ['$event']) onKeyPress(event) {
    return new RegExp(this.regexStr).test(event.key);
  }

  @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
    event.preventDefault();
  }
}
