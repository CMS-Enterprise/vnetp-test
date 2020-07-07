import { of } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';

export class NgxSmartModalServiceStub {
  localObject = {
    Name: 'Test',
    Type: 'tcp',
    SourcePort: '80',
    DestinationPort: '80',
    Description: 'Description',
    ServiceObjects: [{ Name: 'Name' }],
    NetworkObjects: [{ Name: 'Test' }],
  };

  getModal(id) {
    return {
      open: () => {},
      getData: () => {
        return this.localObject;
      },
      setData: obj => {
        this.localObject = obj;
      },
      close: () => {
        return;
      },
      isVisible: () => {},
      onOpen: of({}),
      onAnyCloseEvent: of({
        getData() {
          return this.localObject;
        },
      }),
    };
  }

  get(id) {
    return {
      open: () => {},
      close: () => {},
      isVisible: () => {},
      onOpen: of({}),
      onAnyCloseEvent: of({}),
    };
  }

  close() {
    return;
  }

  resetModalData() {
    return;
  }
  setModalData() {
    return;
  }
  getModalData() {
    return {
      ModalMode: ModalMode.Edit,
    };
  }

  unsubscribe() {
    return null;
  }
}
