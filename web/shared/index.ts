export interface Unidad {
  id: number;
  nombre: string;
  presupuesto: number;
  gastado: number;
  estado: 'en_obra' | 'listo' | 'alquilado';
}

export enum UserRole {
  OWNER = 'OWNER',
  ARCHITECT = 'ARCHITECT',
  MANAGER = 'MANAGER'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface Property {
  id: string;
  name: string;
  address?: string;
  bucket: string;
  owner_id?: string;
  cadastral_reference?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MortgageProposal {
  id: string;
  property_id: string;
  provider: string;
  amount: number;
  interest_rate: number;
  type: 'Fija' | 'Variable' | 'Mixta';
  bonuses: string[];
  monthly_payment: number;
  status: 'In Review' | 'Approved' | 'Rejected';
  details: string;
  document_url?: string;
}

export interface RenovationConcept {
  name: string;
  cost: number;
}

export interface RenovationProposal {
  id: string;
  property_id: string;
  provider: string;
  amount: number;
  duration_months: number;
  concepts: RenovationConcept[];
  status: 'In Review' | 'Approved' | 'Rejected';
  details: string;
  document_url?: string;
}

export interface PropertyPhase {
  id: string;
  property_id: string;
  name: string;
  progress: number;
  status: 'Completado' | 'En curso' | 'Pendiente';
}

export interface DocumentOrInvoice {
  id: string;
  property_id: string;
  file_name: string;
  type: 'Invoice' | 'Document';
  status: 'Pending' | 'Approved' | 'Paid' | 'In Review';
  preview_url: string;
  updated_at?: string;
}

export interface Photo {
  id: string;
  folder_id: string;
  url: string;
  description: string;
}

export interface PhotoFolder {
  id: string;
  property_id: string;
  name: string;
  cover_url: string;
  photo_count: number;
  photos?: Photo[];
  updated_at?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  unit: string;
  status: string;
  image: string;
  pending?: boolean;
  reconciled?: boolean;
}

export interface Camera {
  name: string;
  status: string;
  icon: string;
  image: string;
}

export interface Light {
  name: string;
  status: boolean;
  brightness: number;
}

export interface PropertyStats {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  progress: number;
}

export interface Phase {
  name: string;
  progress: number;
  status: string;
  budget: number;
  spent: number;
}

export interface Invoice {
  provider: string;
  amount: number;
  date: string;
  status: string;
}

export interface DailyRentalStats {
  occupancy: number;
  avgDailyRate: number;
  revenueMonth: number;
  upcomingCheckouts: number;
}

export interface Booking {
  guest: string;
  checkIn?: string;
  checkOut?: string;
  dates?: string;
  status: string;
  platform: string;
  image?: string;
}

export interface Tenant {
  name: string;
  location: string;
  image: string;
  rent: number;
  nextPayment: string;
  deposit: number;
}

export interface Transaction {
  title: string;
  date: string;
  amount: number;
  status: string;
}

export interface AmortizationMilestone {
  year: number;
  totalPaid: number;
  principal: number;
  interest: number;
  balance: number;
  status: string;
}
