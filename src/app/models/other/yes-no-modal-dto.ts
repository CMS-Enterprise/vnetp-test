export class YesNoModalDto {
  constructor(title: string, body: string) {
    this.modalTitle = title;
    this.modalBody = body;
  }

  modalTitle: string;

  modalBody: string;

  modalYes: boolean;
}
