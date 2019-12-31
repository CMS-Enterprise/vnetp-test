import { ModalMode } from '../other/modal-mode';
import { Tier } from 'api_client';

export class TierModalDto {
  DatacenterId: string;

  Tier: Tier;

  ModalMode: ModalMode;
}
