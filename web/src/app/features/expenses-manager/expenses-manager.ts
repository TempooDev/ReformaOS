import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { DecimalPipe, DatePipe, CommonModule } from '@angular/common';
import { Expense, ExpenseStatus } from '@shared';
import { ReformaService } from '../../core/services/reforma';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-expenses-manager',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, FormsModule],
  templateUrl: './expenses-manager.html',
  styleUrl: './expenses-manager.css'
})
export class ExpensesManagerComponent implements OnInit {
  private reformaService = inject(ReformaService);
  
  // State
  allExpenses = signal<Expense[]>([]);
  filterUnit = signal<string>('All');
  isUploadModalOpen = signal<boolean>(false);
  isDetailModalOpen = signal<boolean>(false);
  selectedExpense = signal<Expense | null>(null);
  
  availableStatuses: ExpenseStatus[] = ['PENDING', 'APPROVED', 'RECONCILED', 'REJECTED'];
  
  statusTranslations: Record<ExpenseStatus, string> = {
    'PENDING': 'Pendiente',
    'APPROVED': 'Aprobado',
    'RECONCILED': 'Conciliado',
    'REJECTED': 'Rechazado'
  };
  
  // Form State for new expense
  newExpense = {
    title: '',
    category: 'Materiales',
    amount: 0,
    unit: 'Alquiler Diario',
    date: new Date().toISOString().split('T')[0]
  };
  selectedFile: File | null = null;

  // Computed filtered list
  expenses = computed(() => {
    const unit = this.filterUnit();
    if (unit === 'All') return this.allExpenses();
    return this.allExpenses().filter(e => e.unit === unit);
  });

  constructor() {
    effect(() => {
      const pId = this.reformaService.activePropertyId();
      if (pId) {
        this.loadExpenses(pId);
      }
    });
  }

  ngOnInit() {
    const pId = this.reformaService.activePropertyId();
    if (pId) {
      this.loadExpenses(pId);
    }
  }

  loadExpenses(propertyId: string) {
    this.reformaService.getExpenses(propertyId).subscribe(data => {
      this.allExpenses.set(data);
    });
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
    this.selectedExpense.set({ ...expense });
    this.isDetailModalOpen.set(true);
  }

  closeDetail() {
    this.isDetailModalOpen.set(false);
    this.selectedExpense.set(null);
  }

  setStatus(status: ExpenseStatus) {
    const expense = this.selectedExpense();
    if (!expense) return;
    
    expense.status = status;
    expense.pending = (status === 'PENDING' || status === 'REJECTED');
    expense.reconciled = (status === 'RECONCILED');
  }

  saveChanges() {
    const expense = this.selectedExpense();
    if (!expense) return;

    this.reformaService.updateExpense(expense.id, expense).subscribe(() => {
      const pId = this.reformaService.activePropertyId();
      if (pId) this.loadExpenses(pId);
      this.closeDetail();
    });
  }

  // Upload Modal Methods
  openUploadModal() {
    this.isUploadModalOpen.set(true);
  }

  closeUploadModal() {
    this.isUploadModalOpen.set(false);
    this.selectedFile = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  saveExpense() {
    const pId = this.reformaService.activePropertyId();
    if (!pId) return;

    const formData = new FormData();
    formData.append('title', this.newExpense.title);
    formData.append('category', this.newExpense.category);
    formData.append('amount', this.newExpense.amount.toString());
    formData.append('unit', this.newExpense.unit);
    formData.append('date', this.newExpense.date);
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.reformaService.createExpense(pId, formData).subscribe(() => {
      this.loadExpenses(pId);
      this.closeUploadModal();
      this.newExpense.title = '';
      this.newExpense.amount = 0;
    });
  }

  deleteExpense(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      this.reformaService.deleteExpense(id).subscribe(() => {
        const pId = this.reformaService.activePropertyId();
        if (pId) this.loadExpenses(pId);
        if (this.isDetailModalOpen()) this.closeDetail();
      });
    }
  }

  updateStatus(expense: Expense, newStatus: ExpenseStatus) {
    const updated = { 
      ...expense, 
      status: newStatus,
      pending: newStatus === 'PENDING' || newStatus === 'REJECTED',
      reconciled: newStatus === 'RECONCILED'
    };
    
    this.reformaService.updateExpense(expense.id, updated).subscribe(() => {
      const pId = this.reformaService.activePropertyId();
      if (pId) this.loadExpenses(pId);
    });
  }
}
