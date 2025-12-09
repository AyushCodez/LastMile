import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateRouteComponent } from './create-route/create-route.component';
import { SelectRouteComponent } from './select-route/select-route.component';
import { VehicleRegistrationComponent } from './vehicle-registration/vehicle-registration.component';
import { DriverProfileComponent } from './driver-profile/driver-profile.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'create-route', component: CreateRouteComponent },
  { path: 'select-route', component: SelectRouteComponent },
  { path: 'vehicle', component: VehicleRegistrationComponent },
  { path: 'profile', component: DriverProfileComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRoutingModule { }
