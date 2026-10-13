import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';

export interface IntegrationTestRecord {
  id: string;
  message: string;
  created_at: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
}

export interface ProjectWithTasks {
  id: number;
  name: string | null;
  description: string | null;
  status: string | null;
  tasks: ProjectTask[];
}

@Injectable({
  providedIn: 'root',
})
export class IntegrationTestService {
  private readonly supabaseService = inject(SupabaseService);

  readonly records = signal<IntegrationTestRecord[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly projects = signal<ProjectWithTasks[]>([]);
  readonly projectsLoading = signal(false);
  readonly projectsError = signal<string | null>(null);

  async loadRecords(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { data, error } = await this.supabaseService.client
        .from('integration_test')
        .select('id, message, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        this.error.set(error.message);
        return;
      }

      this.records.set(data ?? []);
    } catch {
      this.error.set('Unable to connect to Supabase.');
    } finally {
      this.loading.set(false);
    }
  }

  async addRecord(message: string): Promise<boolean> {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      this.error.set('Message cannot be empty.');
      return false;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      const { error } = await this.supabaseService.client
        .from('integration_test')
        .insert({ message: trimmedMessage });

      if (error) {
        this.error.set(error.message);
        return false;
      }

      await this.loadRecords();
      return this.error() === null;
    } catch {
      this.error.set('Unable to save the record to Supabase.');
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async updateRecord(id: string, message: string): Promise<boolean> {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      this.error.set('Message cannot be empty.');
      return false;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      const { data, error } = await this.supabaseService.client
        .from('integration_test')
        .update({ message: trimmedMessage })
        .eq('id', id)
        .select('id');

      if (error) {
        this.error.set(error.message);
        return false;
      }

      if (!data?.length) {
        this.error.set(
          'No record was updated. Check the record and permissions.',
        );
        return false;
      }

      await this.loadRecords();
      return this.error() === null;
    } catch {
      this.error.set('Unable to update the record in Supabase.');
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async deleteRecord(id: string): Promise<boolean> {
    this.saving.set(true);
    this.error.set(null);

    try {
      const { data, error } = await this.supabaseService.client
        .from('integration_test')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) {
        this.error.set(error.message);
        return false;
      }

      if (!data?.length) {
        this.error.set(
          'No record was deleted. Check the record and permissions.',
        );
        return false;
      }

      await this.loadRecords();
      return this.error() === null;
    } catch {
      this.error.set('Unable to delete the record from Supabase.');
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async loadProjectsWithTasks(): Promise<void> {
    this.projectsLoading.set(true);
    this.projectsError.set(null);

    try {
      const { data, error } = await this.supabaseService.client
        .from('projects')
        .select(
          `
        id,
        name,
        description,
        status,
        tasks (
          id,
          title,
          is_completed,
          created_at
        )
      `,
        )
        .order('id', { ascending: true });

      if (error) {
        this.projectsError.set(error.message);
        return;
      }

      this.projects.set((data ?? []) as ProjectWithTasks[]);
    } catch {
      this.projectsError.set('Unable to load projects and their tasks.');
    } finally {
      this.projectsLoading.set(false);
    }
  }

  async toggleTaskCompletion(
    taskId: string,
    isCompleted: boolean,
  ): Promise<boolean> {
    this.projectsError.set(null);

    try {
      const { data, error } = await this.supabaseService.client
        .from('tasks')
        .update({ is_completed: isCompleted })
        .eq('id', taskId)
        .select('id');

      if (error) {
        this.projectsError.set(error.message);
        return false;
      }

      if (!data?.length) {
        this.projectsError.set(
          'No task was updated. Check the task and permissions.',
        );
        return false;
      }

      await this.loadProjectsWithTasks();
      return this.projectsError() === null;
    } catch {
      this.projectsError.set('Unable to update the task.');
      return false;
    }
  }
}
