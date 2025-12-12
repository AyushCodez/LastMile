import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { CreateUserRequest, CreateUserRequest_Role } from '../../../proto/user';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['RIDER', Validators.required] // Default to RIDER
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const { name, email, password, role } = this.signupForm.value;

      const req: CreateUserRequest = {
        name,
        email,
        password,
        role: role === 'DRIVER' ? CreateUserRequest_Role.DRIVER : CreateUserRequest_Role.RIDER
      };

      this.authService.signup(req).subscribe({
        next: (res) => {
          // Auto login or redirect to login
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.error = 'Signup failed. Please try again.';
          console.error(err);
        }
      });
    }
  }
}
