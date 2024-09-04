import { EndpointSecurityGroup } from 'client';
import { ModalMode } from '../other/modal-mode';

export class EndpointSecurityGroupModalDto {
  modalMode: ModalMode;
  endpointSecurityGroup: EndpointSecurityGroup;
}
