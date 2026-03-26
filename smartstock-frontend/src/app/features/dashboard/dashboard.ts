import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatToolbarModule],
  template: `
    <mat-toolbar color="primary">
      <span>SmartStock - Panel de Control</span>
      <span class="spacer"></span>
      <button mat-button (click)="logout()">Cerrar Sesión</button>
    </mat-toolbar>

    <div class="content">
      <h1>Bienvenido al Sistema de Inventario</h1>
      <p>Si estás viendo esto, el <strong>AuthGuard</strong> y el <strong>JWT Token</strong> funcionan correctamente.</p>
      
      <div class="stats-grid">
        <div class="card">Próximamente: Gráficos de Stock</div>
        <div class="card">Próximamente: Últimos Movimientos</div>
      </div>
    </div>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .content { padding: 20px; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    .card { border: 1px solid #ccc; padding: 20px; border-radius: 8px; text-align: center; background: #f9f9f9; }
  `]
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}