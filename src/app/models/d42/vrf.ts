import { CustomFieldsObject, CustomField } from '../interfaces/custom-fields-object.interface';
import { Subnet } from './subnet';

export class Vrf implements CustomFieldsObject {
    id: number;

    name: string;

    tags: Array<string>;

    subnets?: Array<Subnet>;

    custom_fields: Array<CustomField>;
}

export class VrfResponse {
    vrfs: Vrf[];
}
