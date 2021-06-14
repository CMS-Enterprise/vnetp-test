import { VmwareVirtualMachine } from 'client';
import { ModalMode } from '../other/modal-mode';

export class VirtualMachineModalDto {
  VmwareVirtualMachine: VmwareVirtualMachine;
  ModalMode: ModalMode;
  DatacenterId: string;
  VirtualMachineId: string;
}
