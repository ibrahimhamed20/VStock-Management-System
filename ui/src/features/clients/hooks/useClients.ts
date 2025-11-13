import { useQuery } from '@tanstack/react-query';
import { clientsService } from '../services';
import type { ClientFilters } from '../types';

export const useClients = (filters?: ClientFilters) => {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientsService.getClients(filters),
  });
};

export const useClient = (id: string | null) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => (id ? clientsService.getClientById(id) : null),
    enabled: !!id,
  });
};

export const useClientTransactions = (id: string | null) => {
  return useQuery({
    queryKey: ['client-transactions', id],
    queryFn: () => (id ? clientsService.getTransactionHistory(id) : []),
    enabled: !!id,
  });
};

