import { CustomFieldsObject, CustomField } from '../interfaces/custom-fields-object.interface';

// tslint:disable variable-name
export class Subnet implements CustomFieldsObject {
    public subnet_id: number;
    public vrf_group_id?: number;
    public vrf_group_name?: string;
    public name: string;
    public description: string;
    public network: string;
    public gateway: string;
    public mask_bits: number;
    public subnet_mask: string;
    public custom_fields: Array<CustomField>;
    public range_begin?: string;
    public range_end?: string;
}

export interface SubnetResponse {
    total_count: number;
    offset: number;
    limit: number;
    subnets: Subnet[];
}
