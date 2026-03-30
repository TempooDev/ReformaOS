import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'my-home',
        loadComponent: () => import('./features/my-home/my-home').then(m => m.MyHomeComponent)
      },
      {
        path: 'domotica',
        loadComponent: () => import('./features/domotica/domotica').then(m => m.DomoticaComponent)
      },
      {
        path: 'expenses',
        loadComponent: () => import('./features/expenses-manager/expenses-manager').then(m => m.ExpensesManagerComponent)
      },
      {
        path: 'finance',
        loadComponent: () => import('./features/finance-construction/finance-construction').then(m => m.FinanceConstructionComponent)
      },
      {
        path: 'monthly-rental',
        loadComponent: () => import('./features/monthly-rental/monthly-rental').then(m => m.MonthlyRentalComponent)
      },
      {
        path: 'daily-rental',
        loadComponent: () => import('./features/daily-rental/daily-rental').then(m => m.DailyRentalComponent)
      }
    ]
  }
];
