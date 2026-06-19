import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { HttpClient } from '@/data/client/http-client';

export const revenueClient = {
  all: (params?: any) => HttpClient.get<any>(API_ENDPOINTS.REVENUES, params),
};

