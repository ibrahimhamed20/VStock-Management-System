import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchasingService } from '../services';
import type {
  CreatePurchaseData,
  UpdatePurchaseData,
  ReceivePurchaseData,
  CreateSupplierData,
  UpdateSupplierData,
} from '../types';

// Purchase Mutations
export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseData) => purchasingService.createPurchase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'report'] });
    },
  });
};

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchaseData }) =>
      purchasingService.updatePurchase(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase', id] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'report'] });
    },
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchasingService.deletePurchase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'report'] });
    },
  });
};

export const useReceivePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReceivePurchaseData }) =>
      purchasingService.receivePurchase(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase', id] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'report'] });
    },
  });
};

export const useApprovePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchasingService.approvePurchase(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['purchase', id] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'report'] });
    },
  });
};

export const useOrderPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchasingService.orderPurchase(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['purchase', id] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'report'] });
    },
  });
};

export const useCancelPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchasingService.cancelPurchase(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['purchase', id] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'report'] });
    },
  });
};

// Supplier Mutations
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierData) => purchasingService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'dashboard'] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierData }) =>
      purchasingService.updateSupplier(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['supplier', id] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'dashboard'] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchasingService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchasing', 'dashboard'] });
    },
  });
};

// Combined Purchase Mutations Hook
export const usePurchaseMutations = () => {
  const createPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();
  const deletePurchase = useDeletePurchase();
  const receivePurchase = useReceivePurchase();
  const approvePurchase = useApprovePurchase();
  const orderPurchase = useOrderPurchase();
  const cancelPurchase = useCancelPurchase();

  return {
    createPurchase,
    updatePurchase,
    deletePurchase,
    receivePurchase,
    approvePurchase,
    orderPurchase,
    cancelPurchase,
  };
};

// Combined Supplier Mutations Hook
export const useSupplierMutations = () => {
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  return {
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};

