import { Component, inject, signal, computed, linkedSignal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Expense, ExpenseStatus } from '@shared';
import { ReformaService } from '../../core/services/reforma';
import { NotificationService } from '../../core/services/notification';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../core/components/modal/modal';
import { 
  form, 
  FormField, 
  submit, 
  required, 
  min, 
  debounce 
} from '@angular/forms/signals';

@Component({
  selector: 'app-expenses-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, FormField],
  templateUrl: './expenses-manager.html',
  styleUrl: './expenses-manager.css'
})
export class ExpensesManagerComponent {
  private reformaService = inject(ReformaService);
  private notificationService = inject(NotificationService);
  
  // State
  filterUnit = signal<string>('All');
  isUploadModalOpen = signal<boolean>(false);
  isDetailModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);
  
  // Selected expense for detail/delete
  selectedExpenseId = signal<string | null>(null);
  expenseIdToDelete = signal<string | null>(null);

  // Resource for fetching expenses
  expensesResource = httpResource<Expense[]>(() => {
    const pId = this.reformaService.activePropertyId();
    if (!pId) return undefined;
    return `${this.reformaService.apiUrl}/properties/${pId}/expenses`;
  });

  allExpenses = computed(() => this.expensesResource.value() ?? []);
  isLoading = computed(() => this.expensesResource.isLoading());
  error = computed(() => this.expensesResource.error());

  // Derived selected expense
  selectedExpense = computed(() => 
    this.allExpenses().find(e => e.id === this.selectedExpenseId()) ?? null
  );

  // --- Signal Forms: New Expense ---
  newExpenseModel = signal({
    title: '',
    category: 'Materiales',
    amount: 0,
    unit: 'Alquiler Diario',
    date: new Date().toISOString().split('T')[0]
  });

  newExpenseForm = form(this.newExpenseModel, (s) => {
    required(s.title, { message: 'El título es obligatorio' });
    required(s.amount, { message: 'El importe es obligatorio' });
    min(s.amount, 0.01, { message: 'El importe debe ser mayor a 0' });
    required(s.date);
    debounce(s.title, 300);
  });

  // --- Signal Forms: Edit Expense ---
  // linkedSignal resets the edit model whenever the selected expense changes
  editExpenseModel = linkedSignal({
    source: () => this.selectedExpense(),
    computation: (exp) => {
      if (!exp) return {
        title: '',
        amount: 0,
        date: '',
        category: 'Materiales',
        unit: 'Alquiler Diario',
        status: 'PENDING' as ExpenseStatus
      };
      return {
        title: exp.title,
        amount: exp.amount,
        date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : '',
        category: exp.category,
        unit: exp.unit,
        status: exp.status
      };
    }
  });

  editForm = form(this.editExpenseModel, (s) => {
    required(s.title);
    required(s.amount);
    min(s.amount, 0.01);
  });

  selectedFile = signal<File | null>(null);

  availableStatuses: ExpenseStatus[] = ['PENDING', 'APPROVED', 'RECONCILED', 'REJECTED'];
  
  statusTranslations: Record<ExpenseStatus, string> = {
    'PENDING': 'Pendiente',
    'APPROVED': 'Aprobado',
    'RECONCILED': 'Conciliado',
    'REJECTED': 'Rechazado'
  };

  // Filtered list
  expenses = computed(() => {
    const unit = this.filterUnit();
    const data = this.allExpenses();
    if (unit === 'All') return data;
    return data.filter(e => e.unit === unit);
  });

  constructor() {}

  refreshExpenses() {
    this.expensesResource.reload();
  }

  setFilter(unit: string) {
    this.filterUnit.set(unit);
  }

  // Visual Mapping
  getStatusColor(status: ExpenseStatus): string {
    switch (status) {
      case 'RECONCILED': return 'bg-green-500';
      case 'APPROVED': return 'bg-blue-500';
      case 'PENDING': return 'bg-[#f77d00]';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  }

  getUnitColorClass(unit: string): string {
    if (unit === 'Alquiler Diario') return 'bg-[#f77d00]';
    if (unit === 'Mi Hogar') return 'bg-secondary';
    return 'bg-primary';
  }

  // Modal Detail Methods
  openDetail(expense: Expense) {
    this.selectedExpenseId.set(expense.id);
    this.isDetailModalOpen.set(true);
  }

  closeDetail() {
    this.isDetailModalOpen.set(false);
    setTimeout(() => this.selectedExpenseId.set(null), 300);
  }

  setStatus(status: ExpenseStatus) {
    const model = this.editExpenseModel();
    if (!model) return;
    
    this.editExpenseModel.set({
      ...model,
      status: status
    });
  }

  onSaveEdit() {
    submit(this.editForm, async () => {
      const id = this.selectedExpenseId();
      const model = this.editExpenseModel();
      if (!id || !model) return;

      const payload = { 
        ...model,
        pending: model.status === 'PENDING' || model.status === 'REJECTED',
        reconciled: model.status === 'RECONCILED',
        date: new Date(model.date).toISOString()
      };

      this.reformaService.updateExpense(id, payload).subscribe({
        next: () => {
          this.refreshExpenses();
          this.closeDetail();
        },
        error: (err) => console.error('Error updating expense:', err)
      });
    });
  }

  // Upload Modal Methods
  openUploadModal() {
    this.isUploadModalOpen.set(true);
  }

  closeUploadModal() {
    this.isUploadModalOpen.set(false);
    this.selectedFile.set(null);
    this.newExpenseModel.set({
      title: '',
      category: 'Materiales',
      amount: 0,
      unit: 'Alquiler Diario',
      date: new Date().toISOString().split('T')[0]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  onSaveNew() {
    submit(this.newExpenseForm, async () => {
      const pId = this.reformaService.activePropertyId();
      if (!pId) return;

      const model = this.newExpenseModel();
      const formData = new FormData();
      formData.append('title', model.title || 'Sin título');
      formData.append('category', model.category);
      formData.append('amount', (model.amount || 0).toString());
      formData.append('unit', model.unit);
      formData.append('date', model.date);
      
      const file = this.selectedFile();
      if (file) {
        formData.append('image', file);
      }

      this.reformaService.createExpense(pId, formData).subscribe({
        next: () => {
          this.refreshExpenses();
          this.closeUploadModal();
        },
        error: (err) => {
          console.error('Error al guardar el gasto:', err);
          this.notificationService.error(
            'Error al Guardar',
            'Hubo un error al conectar con el servidor al intentar guardar el gasto.'
          );
        }
      });
    });
  }

  // Delete Methods
  deleteExpense(id: string) {
    this.expenseIdToDelete.set(id);
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete() {
    const id = this.expenseIdToDelete();
    if (!id) return;

    this.reformaService.deleteExpense(id).subscribe({
      next: () => {
        this.refreshExpenses();
        this.closeDeleteModal();
        if (this.isDetailModalOpen()) this.closeDetail();
      },
      error: (err) => console.error('Error deleting expense:', err)
    });
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.expenseIdToDelete.set(null);
  }

  updateStatus(expense: Expense, newStatus: ExpenseStatus) {
    const updated = { 
      ...expense, 
      status: newStatus,
      pending: newStatus === 'PENDING' || newStatus === 'REJECTED',
      reconciled: newStatus === 'RECONCILED'
    };
    
    this.reformaService.updateExpense(expense.id, updated).subscribe({
      next: () => this.refreshExpenses(),
      error: (err) => console.error('Error updating status:', err)
    });
  }

  toggleReconciled(expense: Expense) {
    let nextStatus: ExpenseStatus = expense.status;
    if (expense.status === 'RECONCILED') {
        nextStatus = 'APPROVED';
    } else {
        nextStatus = 'RECONCILED';
    }
    this.updateStatus(expense, nextStatus);
  }
}
