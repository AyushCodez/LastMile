import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';

import { DriverRoutingModule } from './driver-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateRouteComponent } from './create-route/create-route.component';
import { SelectRouteComponent } from './select-route/select-route.component';
import { VehicleRegistrationComponent } from './vehicle-registration/vehicle-registration.component';
import { DriverProfileComponent } from './driver-profile/driver-profile.component';
import { RideRequestSnackbarComponent } from './ride-request-snackbar/ride-request-snackbar.component';

@NgModule({
  declarations: [
    DashboardComponent,
    CreateRouteComponent,
    SelectRouteComponent,
    VehicleRegistrationComponent,
    DriverProfileComponent,
    RideRequestSnackbarComponent
  ],
  imports: [
    CommonModule,
    DriverRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatListModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatBadgeModule
  ]
})
export class DriverModule { }
