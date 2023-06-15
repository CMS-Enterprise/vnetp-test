import { ApplicationProfile, EndpointGroup } from 'client';
import { ModalMode } from '../other/modal-mode';

export class ApplicationProfileModalDto {
  ApplicationProfile: ApplicationProfile;
  endpointGroups?: EndpointGroup[];
  ModalMode: ModalMode;
}
