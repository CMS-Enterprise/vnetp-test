import { NetworkAdapter } from './network-adapter';
import { VirtualDisk } from './virtual-disk';

export class VirtualMachine {
    public Name: string;
    public Description: string;
    public Notes: string;

    public CpuCores: number;
    public CoresPerSocket: number;
    public MemoryMB: number;

    public ProjectId : number;
    public TemplateId : number;

    public AddVirtualDisk(size? : number, name? : string, osDisk? : boolean){
        var virtualDisk = new VirtualDisk;

        if (size != null)
            virtualDisk.AllocatedStorageGB = size;
        if (name != null)
            virtualDisk.Name = name;    
        if (osDisk != null)
            virtualDisk.OsDisk = true;

        this.VirtualDisks.push(virtualDisk);
    };

    public AddNetworkAdapter(name? : string){
        var networkAdapter = new NetworkAdapter;

        if (name != null)
            networkAdapter.Name = name;

        this.NetworkAdapters.push(networkAdapter);
    };

    public NetworkAdapters : Array<NetworkAdapter> = [];
    public VirtualDisks : Array<VirtualDisk> = [];
}
