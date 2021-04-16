import { NatRule } from '../../../../../api_client';

export interface NatRulePreview {
  natRulesToBeDeleted: Array<NatRule>;
  natRulesToBeUploaded: Array<NatRule>;
}
