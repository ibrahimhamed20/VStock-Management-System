import apiService from '../../core/services/api';
import type {
  Client,
  CreateClientData,
  UpdateClientData,
  TagClientData,
  Transaction,
  ClientFilters,
} from '../types';

class ClientsService {
  // Client Management
  async getClients(filters?: ClientFilters): Promise<Client[]> {
    const params = new URLSearchParams();
    if (filters?.tag) {
      const response = await apiService.get<Client[]>(`/clients/tag/${encodeURIComponent(filters.tag)}`);
      let clients = response;
      
      // Apply client-side search filter if provided
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        clients = clients.filter(client =>
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.phone.toLowerCase().includes(searchLower) ||
          client.code?.toLowerCase().includes(searchLower)
        );
      }
      
      return clients;
    }
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    const response = await apiService.get<Client[]>(`/clients?${params.toString()}`);
    
    // Apply client-side search filter if provided
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      return response.filter(client =>
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.phone.toLowerCase().includes(searchLower) ||
        client.code?.toLowerCase().includes(searchLower)
      );
    }
    
    return response;
  }

  async getClientById(id: string): Promise<Client> {
    return await apiService.get<Client>(`/clients/${id}`);
  }

  async createClient(data: CreateClientData): Promise<Client> {
    return await apiService.post<Client>('/clients', data);
  }

  async updateClient(id: string, data: UpdateClientData): Promise<Client> {
    return await apiService.patch<Client>(`/clients/${id}`, data);
  }

  async deleteClient(id: string): Promise<void> {
    return await apiService.delete<void>(`/clients/${id}`);
  }

  // Tag Management
  async addTags(id: string, data: TagClientData): Promise<Client> {
    return await apiService.post<Client>(`/clients/${id}/tags`, data);
  }

  async removeTags(id: string, data: TagClientData): Promise<Client> {
    return await apiService.delete<Client>(`/clients/${id}/tags`, { data });
  }

  // Transaction Management
  async getTransactionHistory(id: string): Promise<Transaction[]> {
    return await apiService.get<Transaction[]>(`/clients/${id}/transactions`);
  }

  async addTransaction(id: string, transaction: Transaction): Promise<Client> {
    return await apiService.post<Client>(`/clients/${id}/transactions`, transaction);
  }
}

export const clientsService = new ClientsService();

