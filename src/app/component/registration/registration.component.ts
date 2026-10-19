import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseAuthUser } from '../../Model/auth-response.model';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent, ToastType } from '../toast/toast.component';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, ToastComponent],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent implements OnInit {
  router: Router = inject(Router);
  fb: FormBuilder = inject(FormBuilder);
  protected readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  registeredUser?: SupabaseAuthUser;
  registerForm!: FormGroup;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

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
    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        userName: ['', [Validators.required, Validators.minLength(3)]],
        password: [
          '',
          [Validators.required, Validators.pattern(passwordPattern)],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator },
    );
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((value) => !value);
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
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.showToast('error', 'Please fill in all required fields correctly.');
      return;
    }

    const { email, password, userName } = this.registerForm.getRawValue();

    const response = await this.authService.signUp(email, password, userName);

    if (response) {
      this.registeredUser = response as SupabaseAuthUser;
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(
          'currentUser',
          JSON.stringify(this.registeredUser),
        );
      }
      this.showToast(
        'success',
        'Registration successful! Please check your email to confirm your account.',
        6000,
      );
      this.registerForm.reset();
    } else {
      const errorMessage =
        this.authService.error() || 'Registration failed. Please try again.';
      this.showToast('error', errorMessage, 6000);
    }
  }
}
