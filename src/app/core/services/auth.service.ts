import { Injectable, inject, signal } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabaseService = inject(SupabaseService);

  readonly user = signal<User | null>(null);
  readonly session = signal<Session | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

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

  async signUp(email: string, password: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { data, error } =
        await this.supabaseService.client.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

      if (error) {
        this.error.set(error.message);
        return false;
      }

      this.session.set(data.session);
      this.user.set(data.session?.user ?? null);

      return true;
    } catch {
      this.error.set('Unable to register your account.');
      return false;
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