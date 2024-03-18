import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
})
export class IconButtonComponent {
  @Input() icon: Icon;
  @Input() type = 'default';
  @Input() label = '';

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
    clone: ['far', 'clone'],
  };

  public typeLookup: Record<IconType, string> = {
    default: 'icon',
    danger: 'icon icon--danger',
    success: 'icon icon--success',
  };
}

export type Icon = 'search' | 'add' | 'edit' | 'execute' | 'undo' | 'delete' | 'upload' | 'download' | 'filter' | 'clone';
export type IconType = 'default' | 'danger' | 'success';
