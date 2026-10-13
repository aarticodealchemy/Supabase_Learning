import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';

import {
  IntegrationTestRecord,
  IntegrationTestService,
  ProjectTask,
} from '../integration-test.service';

@Component({
  selector: 'app-integration-test-page',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './integration-test-page.component.html',
  styleUrl: './integration-test-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationTestPageComponent implements OnInit {
  protected readonly testService = inject(IntegrationTestService);

  private readonly platformId = inject(PLATFORM_ID);

  protected readonly message = signal('');
  protected readonly editingRecordId = signal<string | null>(null);

  protected readonly totalRecords = computed(
    () => this.testService.records().length,
  );
  protected readonly totalProjects = computed(
    () => this.testService.projects().length,
  );
  protected readonly totalTasks = computed(() =>
    this.testService
      .projects()
      .reduce((acc, p) => acc + (p.tasks?.length || 0), 0),
  );
  protected readonly completedTasks = computed(() =>
    this.testService
      .projects()
      .reduce(
        (acc, p) =>
          acc + (p.tasks?.filter((t) => t.is_completed).length || 0),
        0,
      ),
  );
  protected readonly taskCompletionPercent = computed(() => {
    const total = this.totalTasks();
    return total > 0 ? Math.round((this.completedTasks() / total) * 100) : 0;
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.refreshAll();
    }
  }

  protected refreshAll(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.testService.loadRecords();
      void this.testService.loadProjectsWithTasks();
    }
  }

  protected startEditing(id: string, currentMessage: string): void {
    this.editingRecordId.set(id);
    this.message.set(currentMessage);
  }

  protected cancelEditing(): void {
    this.editingRecordId.set(null);
    this.message.set('');
  }

  protected async saveMessage(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const editingId = this.editingRecordId();

    const saved = editingId
      ? await this.testService.updateRecord(editingId, this.message())
      : await this.testService.addRecord(this.message());

    if (saved) {
      this.message.set('');
      this.editingRecordId.set(null);
    }
  }

  protected getProjectCompletion(tasks: ProjectTask[] | undefined): number {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.is_completed).length;
    return Math.round((completed / tasks.length) * 100);
  }

  protected getCompletedCount(tasks: ProjectTask[] | undefined): number {
    if (!tasks) return 0;
    return tasks.filter((t) => t.is_completed).length;
  }
}
