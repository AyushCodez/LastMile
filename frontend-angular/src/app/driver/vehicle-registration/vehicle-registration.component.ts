import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DriverGrpcService } from '../driver-grpc.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-vehicle-registration',
  templateUrl: './vehicle-registration.component.html',
  styleUrls: ['./vehicle-registration.component.scss']
})
export class VehicleRegistrationComponent implements OnInit {
  vehicleForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private driverService: DriverGrpcService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {
    this.vehicleForm = this.fb.group({
      vehicleNo: ['', Validators.required],
      capacity: [4, [Validators.required, Validators.min(1), Validators.max(10)]],
      model: ['', Validators.required],
      color: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.loading = true;
    this.driverService.getDriverByUserId(userId).subscribe({
      next: (profile) => {
        if (profile.vehicleNo) {
          this.vehicleForm.patchValue({
            vehicleNo: profile.vehicleNo,
            capacity: profile.capacity,
            model: profile.model,
            color: profile.color
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        // Ignore error if profile not found (new driver)
      }
    });
  }

  onSubmit() {
    if (this.vehicleForm.valid) {
      this.loading = true;
      const { vehicleNo, capacity, model, color } = this.vehicleForm.value;
      const userId = this.authService.getUserId();
      if (!userId) return;

      this.driverService.registerDriver(userId, vehicleNo, capacity, model, color).subscribe({
        next: (res) => {
          this.snackBar.open('Vehicle details saved successfully', 'Close', { duration: 3000 });
          this.loading = false;
          // Navigate to dashboard or create route
          // this.router.navigate(['/driver/dashboard']);
        },
        error: (err) => {
          this.snackBar.open('Failed to save vehicle details', 'Close', { duration: 3000 });
          console.error(err);
          this.loading = false;
        }
      });
    }
  }
}
