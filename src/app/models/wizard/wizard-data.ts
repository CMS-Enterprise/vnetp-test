import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WizardSection {
    Name: string;

    Categories: Array<Category>;

    Status: WizardStatus;

    Expanded ? = false;
}

@Injectable({
    providedIn: 'root'
})
export class Category {
    Name: string;

    Subcategories: Array<Subcategory>;

    Status: WizardStatus;

    Expanded ? = false;
}

export class Subcategory {
    Name: string;

    Items: Array<Item>;

    Status: WizardStatus;

    Expanded ? = false;

}

@Injectable({
    providedIn: 'root'
})
export class Item {
    Name: string;

    Status: WizardStatus;

    Expanded ? = false;
}

export enum WizardStatus {
    Down,
    Warning,
    Up
}
