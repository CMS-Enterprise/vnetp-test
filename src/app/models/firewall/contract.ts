import { FilterEntry } from './filter-entry';

export class Contract {
    Id: number;

    Name: string;

    Description: string;

    FilterEntries: Array<FilterEntry>;
}
