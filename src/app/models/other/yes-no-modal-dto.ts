export class YesNoModalDto {
  constructor(public modalTitle: string, public modalBody: string) {}
  modalYes: boolean;
  allowTierChecked: boolean;
}
