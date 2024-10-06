import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'sidenav';
  isSideNavCollapsed = false;
  screenWidth = 0;
  isSidebarVisible = true;  // Control visibility of sidebar based on route
  currentRoute: string;

  constructor(private router: Router) {
    this.currentRoute = this.router.url;
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentRoute = this.router.url;
      this.checkRouteForSidebar();
    });
  }

  onToggleSideNav(data: SideNavToggle): void {
    if (this.isSidebarVisible) {
      this.screenWidth = data.screenWidth;
      this.isSideNavCollapsed = data.collapsed;
    }
  }

  private checkRouteForSidebar(): void {
    const routesToHideSidebar = [
      '/login',
      '/register',
      '/verify-email',
      '/forgot-password'
    ];

    this.isSidebarVisible = !routesToHideSidebar.includes(this.currentRoute);
  }
}
