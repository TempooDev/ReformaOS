import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { MaintenanceTask } from '@shared';
import { ReformaService } from '../../core/services/reforma';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.css'
})
export class MaintenanceComponent {
  private reformaService = inject(ReformaService);

  // --- Resources ---
  activeId = computed(() => this.reformaService.activePropertyId());

  tasksResource = httpResource<MaintenanceTask[]>(() => 
    this.activeId() ? this.reformaService.getMaintenanceUrl(this.activeId()!) : undefined
  );

  // --- Derived Signals ---
  tasks = computed(() => this.tasksResource.value() ?? []);

  pendingTasks = computed(() => 
    this.tasks().filter(t => t.status !== 'Completed')
  );

  completedTasks = computed(() => 
    this.tasks().filter(t => t.status === 'Completed')
  );

  // Simple "Calendar" logic (just grouping by month/day for a list-based calendar view)
  groupedTasks = computed(() => {
    const groups: { [key: string]: MaintenanceTask[] } = {};
    this.tasks().forEach(task => {
      const date = new Date(task.due_date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(task);
    });
    return Object.entries(groups).map(([month, tasks]) => ({ month, tasks }));
  });

  toggleStatus(task: MaintenanceTask) {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    this.reformaService.updateMaintenanceTask(task.id, { status: newStatus }).subscribe(() => {
      this.tasksResource.reload();
    });
  }
}
