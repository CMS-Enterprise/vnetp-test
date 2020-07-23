// TODO: Import from api_client

export enum NatRuleGroupType {
  Intervrf = 'Intervrf',
  External = 'External',
}

export enum NatRuleServiceType {
  None = 'None',
  ServiceObject = 'ServiceObject',
  ServiceObjectGroup = 'ServiceObjectGroup',
}

export enum NatRuleTranslationType {
  None = 'None',
  Static = 'Static',
  DynamicIp = 'DynamicIp',
  DynamicIpAndPort = 'DynamicIpAndPort',
}

export enum NatRuleAddressType {
  None = 'None',
  NetworkObject = 'NetworkObject',
  NetworkObjectGroup = 'NetworkObjectGroup',
}

export enum NatDirection {
  In = 'In',
  Out = 'Out',
}

export interface NatRuleGroup {
  createdAt?: object;
  deletedAt?: boolean;
  id?: string;
  name: string;
  natRules: NatRule[];
  provisionedAt?: object;
  tierId: string;
  type: NatRuleGroupType;
  updatedAt?: object;
}

export interface NatRule {
  id: string;
  name: string;
  description: string;
  ruleIndex: number;
}
