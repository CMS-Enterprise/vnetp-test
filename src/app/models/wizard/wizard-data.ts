import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WizardSection {
    Name: string;

    Categories: Array<Category>;

    Status: WizardStatus;
}

@Injectable({
    providedIn: 'root'
})
export class Category {
    Name: string;

    Subcategories: Array<Subcategory>;

    Status: WizardStatus;
}

export class Subcategory {
    Name: string;

    Items: Array<Item>;

    Status: WizardStatus;
}

@Injectable({
    providedIn: 'root'
})
export class Item {
    Name: string;

    Status: WizardStatus;
}

export enum WizardStatus {
    Down,
    Warning,
    Up
}
