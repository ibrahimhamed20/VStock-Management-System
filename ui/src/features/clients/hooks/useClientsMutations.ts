import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { clientsService } from '../services';
import type { CreateClientData, UpdateClientData, TagClientData, Transaction } from '../types';

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientData) => clientsService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      message.success('Client created successfully');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to create client');
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientData }) =>
      clientsService.updateClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      message.success('Client updated successfully');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to update client');
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      message.success('Client deleted successfully');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to delete client');
    },
  });
};

export const useAddTags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TagClientData }) =>
      clientsService.addTags(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      message.success('Tags added successfully');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to add tags');
    },
  });
};

export const useRemoveTags = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TagClientData }) =>
      clientsService.removeTags(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      message.success('Tags removed successfully');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to remove tags');
    },
  });
};

export const useAddTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, transaction }: { id: string; transaction: Transaction }) =>
      clientsService.addTransaction(id, transaction),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['client-transactions', variables.id] });
      message.success('Transaction added successfully');
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Failed to add transaction');
    },
  });
};

