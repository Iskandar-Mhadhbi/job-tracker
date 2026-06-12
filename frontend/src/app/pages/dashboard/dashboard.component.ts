import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ApplicationsService } from '../../services/applications.service';
import { AuthService } from '../../services/auth.service';
import { ApplicationStats } from '../../models/application.model';
import { Observable, startWith } from 'rxjs';

const defaultStats: ApplicationStats = {
  total: 0, applied: 0, interview: 0, offer: 0, rejected: 0,
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private applicationsService = inject(ApplicationsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  userName = this.authService.currentUser?.name ?? 'there';
  stats$: Observable<ApplicationStats> = this.applicationsService
    .getStats()
    .pipe(startWith(defaultStats));

  logout() {
    this.authService.logout();
  }
}
