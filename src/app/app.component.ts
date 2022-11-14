import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: ['.app { padding: 0 2rem }'],
})
export class AppComponent implements OnInit {
  dcsVersion = '';

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private title: Title) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data),
      )
      .subscribe(event => {
        this.title.setTitle(event.title || 'Automation');
      });

    this.dcsVersion = environment?.environment?.dcsVersion;
  }
}
