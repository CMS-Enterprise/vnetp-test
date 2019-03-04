import { NetworkAdapter } from './network-adapter';
import { VirtualDisk } from './virtual-disk';
import { Template } from './template';
import { isUndefined } from 'util';

export class VirtualMachine {
    NetworkAdapters: Array<NetworkAdapter> = new Array<NetworkAdapter>();
    VirtualDisks: Array<VirtualDisk> = new Array<VirtualDisk>();

    constructor(template?: Template, name?: string) {
        if (!isUndefined(template)) {
            this.Name = template.Name;
            this.Description = template.Description;
            this.TemplateId = template.Id;
            this.CpuCores = template.CpuCores;
            this.MemoryMB = template.MemoryMB;
            this.AddVirtualDisk(new VirtualDisk('OS Disk', template.DiskGB));
            this.AddNetworkAdapter(new NetworkAdapter());
        }
    }

    Id: number;
    Name: string;
    Description: string;
    Notes: string;
    Status: number;
    StatusString: number;
    CpuCores: number;
    MemoryMB: number;
    TemplateId: number;
    ProjectId: number;

    AddVirtualDisk(virtualDisk?: VirtualDisk) {
        this.VirtualDisks.push(virtualDisk);
    }

    AddNetworkAdapter(networkAdapter?: NetworkAdapter) {
        this.NetworkAdapters.push(networkAdapter);
    }
}

