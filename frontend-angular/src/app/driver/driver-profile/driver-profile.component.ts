import { Component, OnInit } from '@angular/core';
import { DriverGrpcService } from '../driver-grpc.service';
import { DriverProfile } from '../../../proto/driver';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-driver-profile',
  templateUrl: './driver-profile.component.html',
  styleUrls: ['./driver-profile.component.scss']
})
export class DriverProfileComponent implements OnInit {
  profile: DriverProfile | null = null;
  loading = false;

  constructor(
    private driverService: DriverGrpcService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    const userId = this.authService.getUserId();
    if (userId) {
      this.driverService.getDriverByUserId(userId).subscribe({
        next: (profile) => {
          this.profile = profile;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }
}
