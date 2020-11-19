import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-view-field',
  templateUrl: './view-field.component.html',
  styleUrls: ['./view-field.component.scss'],
})
export class ViewFieldComponent {
  @Input() background: 'none' | 'default' = 'default';
  @Input() label: string;
  @Input() value: string | number | boolean;
}
