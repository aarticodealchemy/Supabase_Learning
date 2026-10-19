import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabaseService = inject(SupabaseService);

  readonly user = signal<User | null>(null);
  readonly session = signal<Session | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    // Restore an existing browser session.
    void this.initializeSession();

    // Keep Signals synchronized with future auth changes.
    const {
      data: { subscription },
    } = this.supabaseService.client.auth.onAuthStateChange(
      (_event, session) => {
        this.session.set(session);
        this.user.set(session?.user ?? null);
      },
    );

    // Supabase manages this subscription for the client lifetime.
    // No component-level subscription is required.
  }

  private async initializeSession(): Promise<void> {
    try {
      const {
        data: { session },
        error,
      } = await this.supabaseService.client.auth.getSession();

      if (error) {
        this.error.set(error.message);
        return;
      }

      this.session.set(session);
      this.user.set(session?.user ?? null);
    } catch {
      this.error.set('Unable to restore your session.');
    }
  }


  async signUp(
    email: string,
    password: string,
    userName: string,
  ): Promise<User | null> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { data, error } =
        await this.supabaseService.client.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: isPlatformBrowser(this.platformId)
              ? window.location.origin
              : undefined,
            data: {
              userName: userName.trim(),
            },
          },
        });

      if (error) {
        this.error.set(error.message);
        return null;
      }

      this.session.set(data.session);
      this.user.set(data.user ?? data.session?.user ?? null);

      if (data.user && isPlatformBrowser(this.platformId)) {
        localStorage.setItem('registered_user', JSON.stringify(data.user));
      }

      return data.user;
    } catch {
      this.error.set('Unable to register your account.');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async signIn(email: string, password: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { data, error } =
        await this.supabaseService.client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        this.error.set(error.message);
        return false;
      }

      this.session.set(data.session);
      this.user.set(data.user);

      return true;
    } catch {
      this.error.set('Unable to sign in.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async signOut(): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { error } =
        await this.supabaseService.client.auth.signOut();

      if (error) {
        this.error.set(error.message);
        return false;
      }

      this.session.set(null);
      this.user.set(null);

      return true;
    } catch {
      this.error.set('Unable to sign out.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

}