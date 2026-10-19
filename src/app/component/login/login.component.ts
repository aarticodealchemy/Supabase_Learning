import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { User } from '../../Model/user.model';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent, ToastType } from '../toast/toast.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, ToastComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  user?: User;
  loginForm!: FormGroup;
  hidePassword = signal(true);

  toast = signal<{
    show: boolean;
    type: ToastType;
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });
  private toastTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.activeRoute.data.subscribe((data) => {
      this.user = data;
      console.log('userdata in login page:', data);
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  showToast(type: ToastType, message: string, duration = 4000): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toast.set({ show: true, type, message });

    if (isPlatformBrowser(this.platformId)) {
      this.toastTimeout = setTimeout(() => {
        this.toast.update((current) => ({ ...current, show: false }));
      }, duration);
    }
  }

  closeToast(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toast.update((current) => ({ ...current, show: false }));
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.showToast('error', 'Please fill in all required fields correctly.');
      return;
    }

    const { email, password } = this.loginForm.getRawValue();

    const success = await this.authService.signIn(email, password);

    if (success) {
      this.showToast('success', 'Login successful! Redirecting...');
      setTimeout(() => {
        this.router.navigate(['/detail-page']);
      }, 1200);
    } else {
      const errorMessage =
        this.authService.error() ||
        'Invalid email or password. Please try again.';
      this.showToast('error', errorMessage, 5000);
    }
  }
}
