export class VirtualDisk {

    constructor(name?: string, allocatedSpaceGB?: number) {
        this.Name = name;
        this.AllocatedStorageGB = allocatedSpaceGB;
    }

    Id: number;
    Name: string;
    AllocatedStorageGB: number;
}
