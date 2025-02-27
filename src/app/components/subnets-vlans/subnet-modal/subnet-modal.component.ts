import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { V1NetworkSubnetsService, Subnet, Vlan, V1NetworkVlansService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { SubnetModalDto } from 'src/app/models/network/subnet-modal-dto';
import { SubnetModalHelpText } from 'src/app/helptext/help-text-networking';
import { IpAddressCidrValidator, IpAddressIpValidator } from 'src/app/validators/network-form-validators';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-subnet-modal',
  templateUrl: './subnet-modal.component.html',
})
export class SubnetModalComponent implements OnInit {
  public ModalMode: ModalMode;
  public SubnetId: string;
  public TierId: string;
  public form: UntypedFormGroup;
  public submitted: boolean;
  public vlans: Vlan[];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private subnetService: V1NetworkSubnetsService,
    public helpText: SubnetModalHelpText,
    public vlanService: V1NetworkVlansService,
  ) {}

  get f() {
    return this.form.controls;
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description, network, gateway, sharedBetweenVrfs } = this.form.value;
    const subnet = {
      name,
      description,
      network,
      gateway,
      sharedBetweenVrfs,
    } as Subnet;

    if (this.ModalMode === ModalMode.Create) {
      this.createSubnet(subnet);
    } else {
      this.editSubnet(subnet);
    }
  }

  public closeModal(): void {
    this.ngx.close('subnetModal');
    this.reset();
  }

  private getTierVlans(): void {
    this.vlanService
      .getManyVlan({
        filter: [`tierId||eq||${this.TierId}`, 'deletedAt||isnull'],
        sort: ['updatedAt,ASC'],
        page: 1,
        perPage: 10000,
      })
      .subscribe(
        response => {
          this.vlans = response.data;
        },
        () => {
          this.vlans = null;
        },
      );
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('subnetModal') as SubnetModalDto);

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    this.ModalMode = dto.ModalMode;

    if (this.ModalMode === ModalMode.Edit) {
      this.SubnetId = dto.Subnet.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.vlan.enable();
      this.form.controls.network.enable();
      this.form.controls.gateway.enable();
    }

    // get all Vlans that belong to this tier, no filtering
    this.getTierVlans();

    const subnet = dto.Subnet;

    if (subnet !== undefined) {
      this.form.controls.name.setValue(subnet.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(subnet.description);
      this.form.controls.vlan.setValue(subnet.vlanId);
      this.form.controls.vlan.disable();
      this.form.controls.network.setValue(subnet.network);
      this.form.controls.network.disable();
      this.form.controls.gateway.setValue(subnet.gateway);
      this.form.controls.gateway.disable();
      this.form.controls.sharedBetweenVrfs.setValue(subnet.sharedBetweenVrfs);
    }
    this.ngx.resetModalData('subnetModal');
  }

  public reset(): void {
    this.submitted = false;
    this.TierId = '';
    this.SubnetId = '';
    this.ngx.resetModalData('subnetModal');
    this.buildForm();
  }

  private createSubnet(subnet: Subnet): void {
    subnet.tierId = this.TierId;
    subnet.vlanId = this.form.value.vlan;
    this.subnetService.createOneSubnet({ subnet }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editSubnet(subnet: Subnet): void {
    delete subnet.name;
    delete subnet.network;
    delete subnet.gateway;
    delete subnet.tierId;
    delete subnet.vlanId;
    this.subnetService.updateOneSubnet({ id: this.SubnetId, subnet }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      network: ['', Validators.compose([Validators.required, IpAddressCidrValidator])],
      gateway: ['', Validators.compose([Validators.required, IpAddressIpValidator])],
      vlan: ['', Validators.required],
      sharedBetweenVrfs: [''],
    });
  }

  ngOnInit() {
    this.buildForm();
  }
}
