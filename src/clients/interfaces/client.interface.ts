export interface IClient {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  transactions: ITransaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction {
  id: string;
  amount: number;
  description: string;
  date: Date;
  type: 'purchase' | 'refund' | 'credit';
}

export interface ICreateClient {
  name: string;
  email: string;
  phone: string;
}

export interface IUpdateClient {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ITagClient {
  tags: string[];
}
