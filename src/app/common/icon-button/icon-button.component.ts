import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
})
export class IconButtonComponent {
  @Input() icon: Icon;
  @Input() type = 'default';
  @Input() label: string;

  @Output() handleClick = new EventEmitter<Event>();

  public iconLookup: Record<Icon, string[]> = {
    add: ['fas', 'plus'],
    edit: ['fas', 'pencil-alt'],
    delete: ['fas', 'trash'],
    download: ['fas', 'download'],
    execute: ['fas', 'play'],
    upload: ['fas', 'upload'],
    undo: ['fas', 'undo'],
    search: ['fas', 'search'],
    filter: ['fas', 'filter'],
    pause: ['fas', 'asterisk'],
  };

  public typeLookup: Record<IconType, string> = {
    default: 'icon',
    danger: 'icon icon--danger',
    success: 'icon icon--success',
  };
}

export type Icon = 'search' | 'add' | 'edit' | 'execute' | 'undo' | 'delete' | 'upload' | 'download' | 'filter' | 'pause';
export type IconType = 'default' | 'danger' | 'success';
