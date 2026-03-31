export interface Unidad {
  id: number;
  nombre: string;
  presupuesto: number;
  gastado: number;
  estado: 'en_obra' | 'listo' | 'alquilado';
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

export interface ProjectStats {
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
