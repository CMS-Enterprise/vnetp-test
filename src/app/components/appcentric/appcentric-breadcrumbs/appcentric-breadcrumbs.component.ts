import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-appcentric-breadcrumbs',
  templateUrl: './appcentric-breadcrumbs.component.html',
  styleUrls: ['./appcentric-breadcrumbs.component.scss'],
})
export class AppcentricBreadcrumbsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  public breadcrumbs = [
    { url: '', label: 'appcentric breadcrumb 1' },
    { url: '', label: 'appcentric breadcrumb 2' },
    { url: '', label: 'appcentric breadcrumb 3' },
  ];

  public render = true;
}
