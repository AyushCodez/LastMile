import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RideHistoryComponent } from './ride-history/ride-history.component';
import { RiderProfileComponent } from './rider-profile/rider-profile.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'history', component: RideHistoryComponent },
  { path: 'profile', component: RiderProfileComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RiderRoutingModule { }
