import { ExternalRoute } from 'client/model/externalRoute';
import { ModalMode } from '../other/modal-mode';

export class ExternalRouteModalDto {
  modalMode: ModalMode;
  externalRoute: ExternalRoute;
  wanFormId: string;
}
