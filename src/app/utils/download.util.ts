export default class DownloadUtil {
  static download(fileName: string, data: string): void {
    const link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
