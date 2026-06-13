import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'applications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/applications/applications.component').then((m) => m.ApplicationsComponent),
  },
  {
    path: 'ai-analysis',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/ai-analysis/ai-analysis.component').then((m) => m.AiAnalysisComponent),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
