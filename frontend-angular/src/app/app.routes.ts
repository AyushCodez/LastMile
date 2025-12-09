import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'driver',
                loadChildren: () => import('./driver/driver.module').then(m => m.DriverModule)
            },
            {
                path: 'rider',
                loadChildren: () => import('./rider/rider.module').then(m => m.RiderModule)
            },
            {
                path: '',
                redirectTo: 'auth/login',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];
