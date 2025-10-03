import { ExternalVrfConnection, InternalRoute } from '../../../../client';
import { ModalMode } from '../other/modal-mode';

export class InternalRouteModalDto {
  modalMode: ModalMode;
  internalRoute: InternalRoute;
  externalVrfConnection: ExternalVrfConnection;
  tenantId: string;
}
