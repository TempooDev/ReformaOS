export interface Unit {
  id: number;
  name: string;
  budget: number;
  spent: number;
  status: 'under_construction' | 'ready' | 'rented';
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
  budget: number;
  acquisition_price: number;
  projected_value: number;
  annual_appreciation: number;
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
  term_months: number;
  start_date: string;
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
  status: 'Completed' | 'In Progress' | 'Pending';
  budget: number;
  spent: number;
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

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'RECONCILED' | 'REJECTED';

export interface Expense {
  id: string;
  property_id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  unit: string;
  status: ExpenseStatus;
  image: string;
  pending: boolean;
  reconciled: boolean;
}

export interface Camera {
  id: string;
  property_id: string;
  name: string;
  status: string;
  icon: string;
  image: string;
}

export interface Light {
  id: string;
  property_id: string;
  name: string;
  status: boolean;
  brightness: number;
}

export interface MaintenanceTask {
  id: string;
  property_id: string;
  title: string;
  description: string;
  category: string;
  due_date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
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
  id: string;
  guest: string;
  checkIn?: string;
  checkOut?: string;
  check_in?: string;
  check_out?: string;
  dates?: string;
  status: string;
  platform: string;
  image?: string;
  total_price?: number;
}

export interface Tenant {
  id: string;
  property_id: string;
  name: string;
  location: string;
  image: string;
  rent: number;
  start_date: string;
  next_payment: string;
  deposit: number;
}

export interface Transaction {
  id: string;
  property_id: string;
  tenant_id: string;
  title: string;
  date: string;
  amount: number;
  status: string;
}

export interface UtilityReading {
  id: string;
  property_id: string;
  type: 'Electricity' | 'Water';
  meter_id: string;
  value: number;
  reading_date: string;
}

export interface AmortizationMilestone {
  year: number;
  totalPaid: number;
  principal: number;
  interest: number;
  balance: number;
  status: string;
}
