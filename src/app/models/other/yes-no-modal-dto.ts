export class YesNoModalDto {
  constructor(
    public modalTitle: string,
    public modalBody: string,
    public confirmText = 'Yes',
    public cancelText = 'No',
    public confirmButtonType: 'primary' | 'danger' | 'success' = 'primary',
  ) {}
  modalYes: boolean;
  allowTierChecked: boolean;
}
