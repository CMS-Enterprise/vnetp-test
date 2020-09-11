export interface CustomFieldsObject {
  custom_fields: CustomField[];
}

export class CustomField {
  key: string;
  value: string;
  notes: string;
}
