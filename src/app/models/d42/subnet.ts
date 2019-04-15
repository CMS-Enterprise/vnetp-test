import { CustomFieldsObject } from '../custom-fields';

// tslint:disable variable-name
export class Subnet implements CustomFieldsObject {
    public subnet_id: number;
    public name: string;
    public network: string;
    public gateway: string;
    public mask_bits: number;
    public subnet_mask: string;
    public custom_fields: Array<{notes: string, key: string, value: string}>;
}

export interface SubnetResponse {
    total_count: number;
    offset: number;
    limit: number;
    subnets: Subnet[];
}
