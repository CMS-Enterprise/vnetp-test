import { DownloadUtil } from './download.util';

describe('DownloadUtil', () => {
  describe('download', () => {
    it('should click a link', () => {
      spyOn(document.body, 'appendChild').and.stub();
      spyOn(document.body, 'removeChild').and.stub();
      const createElementSpy = spyOn(document, 'createElement').and.callFake(() => {
        const element = {} as HTMLElement;
        element.click = jasmine.createSpy();
        element.setAttribute = jasmine.createSpy();
        return element;
      });

      DownloadUtil.download('test.xls', 'data');

      const createdLink = createElementSpy.calls.first().returnValue;
      expect(createdLink.click).toHaveBeenCalled();
    });
  });
});
