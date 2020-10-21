export class YesNoModalDto {
  constructor(
    public modalTitle: string,
    public modalBody: string,
    public confirmText = 'Yes',
    public cancelText = 'No',
    public confirmButtonType: 'primary' | 'danger' = 'primary',
  ) {}
  modalYes: boolean;
  allowTierChecked: boolean;
}
