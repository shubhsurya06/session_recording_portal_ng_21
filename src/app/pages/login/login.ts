import { NgIf } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth-service';
import { APP_CONSTANT } from '../../core/constant/appConstant';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  // login form group to generate login form
  loginForm: FormGroup;

  // inject auth service to call login api
  authService = inject(AuthService);

  // inject user service, to store logged in user data
  userService = inject(UserService);

  // inject router
  router = inject(Router);

  // loading signal to show loading spinner when user is logging in
  isLoading = signal<boolean>(false);

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {

  }

  // Helper for template access
  get f() { return this.loginForm.controls; }

  // call login api on login form submit
  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);

      let formData = this.loginForm.value;
      console.log('form data with Email and password:', formData);

      this.authService.login(formData).subscribe({
        next: (response: any) => {
          // Stop login loading
          this.isLoading.set(false);

          // Store token and user details in local storage
          localStorage.setItem(APP_CONSTANT.USER_DATA.TOKEN, response.token);
          localStorage.setItem(APP_CONSTANT.USER_DATA.USER_DETAILS, JSON.stringify(response.data));

          // Set user data in user service
          this.userService.setUserData(response.data);

          // navigate to dashboard or another page as needed
          console.log('Login successful:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.isLoading.set(false);

          // Optionally, display an error message to the user
          alert(`Login failed: ${error.error.message || 'Unknown error occurred'}`);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }


}
