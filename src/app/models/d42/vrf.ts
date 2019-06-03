import { CustomFieldsObject, CustomField } from '../interfaces/custom-fields-object.interface';

export class Vrf implements CustomFieldsObject {
    id: number;

    name: string;

    tags: Array<string>;

    custom_fields: Array<CustomField>;
}

export class VrfResponse {
    vrfs: Vrf[];
}
