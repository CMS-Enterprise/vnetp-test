export interface CustomFieldsObject {
    custom_fields: Array<{notes: string, key: string, value: string}>;
}

export class CustomField {
    key: string;
    value: string;
    notes: string;
}
