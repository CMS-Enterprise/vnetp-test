import { ModalMode } from '../other/modal-mode';
import { Tier } from 'client';

export class TierModalDto {
  DatacenterId: string;
  Tier: Tier;
  ModalMode: ModalMode;
}
