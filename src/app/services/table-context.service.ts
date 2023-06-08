import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TableContextService {
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.removeSearchLocalStorage();
      }
    });
  }

  addFilteredResultsLocalStorage(): void {
    localStorage.setItem('filteredResults', JSON.stringify('true'));
  }

  addSearchLocalStorage(searchColumn, searchText, searchString): void {
    localStorage.setItem('searchColumn', searchColumn);
    localStorage.setItem('searchText', searchText);
    localStorage.setItem('searchString', searchString);
  }

  removeSearchLocalStorage(): void {
    localStorage.removeItem('searchText');
    localStorage.removeItem('searchColumn');
    localStorage.removeItem('searchString');
    this.removeFilteredResultsLocalStorage();
  }

  removeFilteredResultsLocalStorage(): void {
    localStorage.removeItem('filteredResults');
  }

  getSearchLocalStorage() {
    const searchColumn = JSON.parse(localStorage.getItem('searchColumn'));
    const searchText = JSON.parse(localStorage.getItem('searchText'));
    const filteredResults = JSON.parse(localStorage.getItem('filteredResults'));
    const searchString = localStorage.getItem('searchString');
    return { searchColumn, searchText, filteredResults, searchString };
  }
}
