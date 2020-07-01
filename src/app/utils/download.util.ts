// tslint:disable-next-line: no-namespace
export namespace DownloadUtil {
  export function download(fileName: string, data: string): void {
    const link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
