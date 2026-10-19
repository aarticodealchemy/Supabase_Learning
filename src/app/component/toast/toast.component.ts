import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  message = input<string>('');
  type = input<ToastType>('info');
  show = input<boolean>(false);

  close = output<void>();

  onClose(): void {
    this.close.emit();
  }
}
