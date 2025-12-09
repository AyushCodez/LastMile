import { Component, OnInit } from '@angular/core';
import { DriverGrpcService } from '../driver-grpc.service';
import { DriverProfile } from '../../../proto/driver_pb';

@Component({
  selector: 'app-driver-profile',
  templateUrl: './driver-profile.component.html',
  styleUrls: ['./driver-profile.component.scss']
})
export class DriverProfileComponent implements OnInit {
  profile: DriverProfile.AsObject | null = null;
  loading = false;

  constructor(private driverService: DriverGrpcService) { }

  ngOnInit(): void {
    this.loading = true;
    this.driverService.getDriverProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
