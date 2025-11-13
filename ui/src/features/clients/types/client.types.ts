export interface Client {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'purchase' | 'refund' | 'credit';
}

export interface CreateClientData {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface TagClientData {
  tags: string[];
}

export interface ClientFilters {
  search?: string;
  tag?: string;
}

