import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (res) => {
          // Redirect based on role
          // We need to decode the token to get the role if it's not in the response
          // AuthService decodes it and stores it.
          const role = this.authService.getUserRole();
          if (role === 'DRIVER') {
            this.router.navigate(['/driver/dashboard']);
          } else if (role === 'RIDER') {
            this.router.navigate(['/rider/dashboard']);
          } else {
            // Default fallback
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.error = 'Login failed. Please check your credentials.';
          console.error(err);
        }
      });
    }
  }
}
