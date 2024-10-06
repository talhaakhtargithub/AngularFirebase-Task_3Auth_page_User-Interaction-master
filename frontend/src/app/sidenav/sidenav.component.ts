import { Component, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { navbarData } from './nav-data';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('350ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('350ms', style({ opacity: 0 }))
      ])
    ]),
    trigger('rotate', [
      transition(':enter', [
        animate('1000ms', keyframes([
          style({ transform: 'rotate(0deg)', offset: '0' }),
          style({ transform: 'rotate(2turn)', offset: '1' })
        ]))
      ])
    ])
  ]
})
export class SidenavComponent implements OnInit {
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed: boolean = false;

  screenWidth = 0;
  navData = navbarData;
  visibleChildren: Set<string> = new Set();

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 768) {
      this.collapsed = false;
      this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
    }
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
  }

  closeSidenav(): void {
    this.collapsed = !this.collapsed;
    console.log('collapsed:', this.collapsed); // Debugging line
    this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
  }


  toggleChild(data: any): void {
    if (data.children) {
      if (this.visibleChildren.has(data.routeLink)) {
        this.visibleChildren.delete(data.routeLink);
      } else {
        this.visibleChildren.add(data.routeLink);
      }
    }
  }

  isChildVisible(data: any): boolean {
    return this.visibleChildren.has(data.routeLink);
  }
}
