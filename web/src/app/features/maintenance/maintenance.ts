import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { MaintenanceTask } from '@shared';
import { ReformaService } from '../../core/services/reforma';
import { NotificationService } from '../../core/services/notification';
import { ModalComponent } from '../../core/components/modal/modal';
import { 
  form, 
  FormField, 
  submit, 
  required 
} from '@angular/forms/signals';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, FormField],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.css'
})
export class MaintenanceComponent {
  private reformaService = inject(ReformaService);
  private notificationService = inject(NotificationService);

  // --- State ---
  isAddModalOpen = signal<boolean>(false);

  // --- Resources ---
  activeId = computed(() => this.reformaService.activePropertyId());

  tasksResource = httpResource<MaintenanceTask[]>(() => 
    this.activeId() ? this.reformaService.getMaintenanceUrl(this.activeId()!) : undefined
  );

  // --- Form: New Task ---
  newTaskModel = signal({
    title: '',
    description: '',
    category: 'Plumbing',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    due_date: new Date().toISOString().split('T')[0]
  });

  newTaskForm = form(this.newTaskModel, (s) => {
    required(s.title);
    required(s.due_date);
  });

  // --- Derived Signals ---
  tasks = computed(() => this.tasksResource.value() ?? []);

  pendingTasks = computed(() => 
    this.tasks().filter(t => t.status !== 'Completed')
  );

  completedTasks = computed(() => 
    this.tasks().filter(t => t.status === 'Completed')
  );

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
      this.notificationService.success('Task updated', 'The task status has been successfully updated.');
    });
  }

  async createMaintenanceTask() {
    const pId = this.activeId();
    if (!pId) return;

    await submit(this.newTaskForm, async () => {
      this.reformaService.createMaintenanceTask(pId, {
        ...this.newTaskModel(),
        status: 'Pending'
      }).subscribe({
        next: () => {
          this.tasksResource.reload();
          this.isAddModalOpen.set(false);
          this.newTaskModel.set({
            title: '',
            description: '',
            category: 'Plumbing',
            priority: 'Medium',
            due_date: new Date().toISOString().split('T')[0]
          });
          this.notificationService.success('Task created', 'The maintenance operation has been registered.');
        },
        error: () => {
          this.notificationService.error('Error', 'Could not create the maintenance task.');
        }
      });
    });
  }
}
