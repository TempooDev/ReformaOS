import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from '@shared';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
        canActivate: [roleGuard],
        data: { roles: [UserRole.OWNER, UserRole.ARCHITECT, UserRole.MANAGER] }
      },
      {
        path: 'my-home',
        loadComponent: () => import('./features/my-home/my-home').then(m => m.MyHomeComponent),
        canActivate: [roleGuard],
        data: { roles: [UserRole.OWNER, UserRole.MANAGER] }
      },
      {
        path: 'domotica',
        loadComponent: () => import('./features/domotica/domotica').then(m => m.DomoticaComponent),
        canActivate: [roleGuard],
        data: { roles: [UserRole.OWNER, UserRole.MANAGER] }
      },
      {
        path: 'expenses',
        loadComponent: () => import('./features/expenses-manager/expenses-manager').then(m => m.ExpensesManagerComponent),
        canActivate: [roleGuard],
        data: { roles: [UserRole.OWNER, UserRole.MANAGER] }
      },
      {
        path: 'finance',
        loadComponent: () => import('./features/finance-construction/finance-construction').then(m => m.FinanceConstructionComponent),
        canActivate: [roleGuard],
        data: { roles: [UserRole.OWNER, UserRole.MANAGER] }
      },
      {
        path: 'monthly-rental',
        loadComponent: () => import('./features/monthly-rental/monthly-rental').then(m => m.MonthlyRentalComponent),
        canActivate: [roleGuard],
        data: { roles: [UserRole.OWNER, UserRole.MANAGER] }
      },
      {
        path: 'daily-rental',
        loadComponent: () => import('./features/daily-rental/daily-rental').then(m => m.DailyRentalComponent),
        canActivate: [roleGuard],
        data: { roles: [UserRole.OWNER, UserRole.MANAGER] }
      },
      {
        path: 'renovation',
        loadComponent: () => import('./features/renovation-manager/renovation-manager').then(m => m.RenovationManagerComponent),
        canActivate: [roleGuard],
        data: { roles: [UserRole.OWNER, UserRole.ARCHITECT, UserRole.MANAGER] }
      },
      {
        path: 'evolucion-patrimonial',
        loadComponent: () => import('./features/evolucion-patrimonial/evolucion-patrimonial').then(m => m.EvolucionPatrimonialComponent),
        canActivate: [roleGuard],
        data: { roles: [UserRole.OWNER] }
      }
    ]
  }
];
