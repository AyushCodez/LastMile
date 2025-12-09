import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { UserProfile } from '../../../proto/user_pb';

@Component({
  selector: 'app-rider-profile',
  templateUrl: './rider-profile.component.html',
  styleUrls: ['./rider-profile.component.scss']
})
export class RiderProfileComponent implements OnInit {
  profile: UserProfile.AsObject | null = null;
  loading = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.loading = true;
    this.authService.getUserProfile().subscribe({
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
