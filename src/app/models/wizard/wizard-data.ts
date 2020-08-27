import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WizardSection {
  Name: string;

  Categories: Array<Category>;

  StatusProgress: number;

  StatusText: string;

  Expanded?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Category {
  Name: string;

  Subcategories: Array<Subcategory>;

  Expanded?: boolean;

  HasWarning?: boolean;

  HasError?: boolean;
}

export class Subcategory {
  Name: string;

  Items: Array<Item>;

  Expanded?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Item {
  Name: string;

  Status: string;

  Description?: string;

  TicketNumber?: number;

  Link?: string;
}
