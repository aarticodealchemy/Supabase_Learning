
import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly supabaseService = inject(SupabaseService);

  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadProfile(): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await this.supabaseService.client.auth.getUser();

      if (userError || !user) {
        this.error.set(userError?.message ?? 'User is not authenticated.');
        return false;
      }

      const { data, error } = await this.supabaseService.client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        this.error.set(error.message);
        return false;
      }

      this.profile.set(data as UserProfile | null);
      return true;
    } catch {
      this.error.set('Unable to load your profile.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async createProfile(
    username: string,
    fullName: string,
  ): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await this.supabaseService.client.auth.getUser();

      if (userError || !user) {
        this.error.set(userError?.message ?? 'User is not authenticated.');
        return false;
      }

      const { data, error } = await this.supabaseService.client
        .from('profiles')
        .insert({
          id: user.id,
          username: username.trim(),
          full_name: fullName.trim(),
        })
        .select()
        .single();

      if (error) {
        this.error.set(error.message);
        return false;
      }

      this.profile.set(data as UserProfile);
      return true;
    } catch {
      this.error.set('Unable to create your profile.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async updateProfile(
    username: string,
    fullName: string,
  ): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await this.supabaseService.client.auth.getUser();

      if (userError || !user) {
        this.error.set(userError?.message ?? 'User is not authenticated.');
        return false;
      }

      const { data, error } = await this.supabaseService.client
        .from('profiles')
        .update({
          username: username.trim(),
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        this.error.set(error.message);
        return false;
      }

      this.profile.set(data as UserProfile);
      return true;
    } catch {
      this.error.set('Unable to update your profile.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }
}
