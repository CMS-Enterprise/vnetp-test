export class TableComponentDto {
  constructor(perPage = 20, page = 1, searchColumn?, searchText?) {
    this.searchColumn = searchColumn;
    this.searchText = searchText;
    this.perPage = perPage;
    this.page = page;
  }
  perPage: number;
  page: number;
  searchColumn?: string;
  searchText?: string;
}
