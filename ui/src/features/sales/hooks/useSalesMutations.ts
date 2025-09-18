import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService } from '../services';
import type {
  CreateInvoiceData,
  UpdateInvoiceData,
  CreatePaymentData,
} from '../types';

// Invoice Mutations
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceData) => salesService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'report'] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceData }) =>
      salesService.updateInvoice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'report'] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'report'] });
    },
  });
};

export const useCancelInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesService.cancelInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'report'] });
    },
  });
};

export const useMarkInvoiceOverdue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesService.markInvoiceOverdue(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'overdue'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'report'] });
    },
  });
};

// Payment Mutations
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentData) => salesService.createPayment(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'invoice', data.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'report'] });
    },
  });
};

// Combined Operations Hook
export const useSalesOperations = () => {
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const cancelInvoice = useCancelInvoice();
  const markOverdue = useMarkInvoiceOverdue();
  const createPayment = useCreatePayment();

  return {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    cancelInvoice,
    markOverdue,
    createPayment,
  };
};

// Individual Operation Hooks
export const useInvoiceOperations = () => {
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const cancelInvoice = useCancelInvoice();
  const markOverdue = useMarkInvoiceOverdue();

  return {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    cancelInvoice,
    markOverdue,
  };
};

export const usePaymentOperations = () => {
  const createPayment = useCreatePayment();

  return {
    createPayment,
  };
};

// Combined Invoice Mutations Hook
export const useInvoiceMutations = () => {
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const cancelInvoice = useCancelInvoice();
  const markInvoiceOverdue = useMarkInvoiceOverdue();

  return {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    cancelInvoice,
    markInvoiceOverdue,
  };
};
