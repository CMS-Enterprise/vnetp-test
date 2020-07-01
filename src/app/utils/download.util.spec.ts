import { DownloadUtil } from './download.util';

describe('DownloadUtil', () => {
  describe('download', () => {
    it('should click a link', () => {
      jest.spyOn(document.body, 'appendChild').mockImplementation();
      jest.spyOn(document.body, 'removeChild').mockImplementation();
      const createElementSpy = jest.spyOn(document, 'createElement').mockImplementation(() => {
        const element = {} as HTMLElement;
        element.click = jest.fn();
        element.setAttribute = jest.fn();
        return element;
      });

      DownloadUtil.download('test.xls', 'data');

      const createdLink = createElementSpy.mock.results[0].value;
      expect(createdLink.click).toHaveBeenCalled();
    });
  });
});
