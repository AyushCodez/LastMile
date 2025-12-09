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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { RiderRoutingModule } from './rider-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RideHistoryComponent } from './ride-history/ride-history.component';
import { RiderProfileComponent } from './rider-profile/rider-profile.component';

@NgModule({
  declarations: [
    DashboardComponent,
    RideHistoryComponent,
    RiderProfileComponent
  ],
  imports: [
    CommonModule,
    RiderRoutingModule,
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
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class RiderModule { }
