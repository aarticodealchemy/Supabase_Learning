import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { User } from '../../Model/user.model';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css',
})
export class DetailComponent implements OnInit {
  activeRoute: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  profileService = inject(ProfileService);
  user?: User;

  readonly profileForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    full_name: [''],
  });

  readonly profileSaving = signal(false);
  readonly profileMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.activeRoute.data.subscribe((data) => {
      this.user = data;
      this.profileService.loadProfile();
      this.loadProfileAndPopulateForm();
      // console.log("data in detailpage");

      // this.router.getCurrentNavigation()
    });
  }

  onLogout(): void {
    this.authService.signOut();
    this.router.navigate(['/login']);
  }

  private async loadProfileAndPopulateForm(): Promise<void> {
    const success = await this.profileService.loadProfile();

    if (success) {
      this.loadProfileIntoForm();
    }
  }

  loadProfileIntoForm(): void {
    const profile = this.profileService.profile();

    if (!profile) {
      return;
    }

    this.profileForm.patchValue({
      username: profile.username ?? '',
      full_name: profile.full_name ?? '',
    });
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileSaving.set(true);
    this.profileMessage.set(null);

    try {
      const { username, full_name } = this.profileForm.getRawValue();

      const success = await this.profileService.updateProfile(
        username,
        full_name,
      );

      if (success) {
        this.profileMessage.set('Profile updated successfully.');
      } else {
        this.profileMessage.set(
          this.profileService.error() ?? 'Unable to update profile.',
        );
      }
    } finally {
      this.profileSaving.set(false);
    }
  }
}
