import { WanForm, WanFormSubnet } from '../../../../client';
import { ModalMode } from '../other/modal-mode';

export class WanFormSubnetModalDto {
  modalMode: ModalMode;
  wanFormSubnet: WanFormSubnet;
  wanForm: WanForm;
}
