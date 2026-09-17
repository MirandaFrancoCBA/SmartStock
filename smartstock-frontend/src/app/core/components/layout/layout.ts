import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class LayoutComponent implements OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);
  private destroy$ = new Subject<void>();

  isCompact = signal(false);

  constructor() {
    this.breakpointObserver.observe('(max-width: 900px)')
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ matches }) => this.isCompact.set(matches));
  }

  closeNavigation(drawer: { close: () => void }) {
    if (this.isCompact()) drawer.close();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
