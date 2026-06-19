import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { HttpClient } from '@/data/client/http-client';

export const vendorSubscriptionClient = {
  me: () => HttpClient.get<any>(API_ENDPOINTS.VENDOR_SUBSCRIPTIONS_ME),
  start: (input: any) =>
    HttpClient.post<any>(API_ENDPOINTS.VENDOR_SUBSCRIPTIONS_START, input),
  confirmTaramoney: (tracking: string) =>
    HttpClient.post<any>(
      `${API_ENDPOINTS.VENDOR_SUBSCRIPTIONS_CONFIRM_TARAMONEY}/${tracking}`,
      {}
    ),
  confirmCampay: (tracking: string) =>
    HttpClient.post<any>(
      `${API_ENDPOINTS.VENDOR_SUBSCRIPTIONS_CONFIRM_CAMPAY}/${tracking}`,
      {}
    ),
  subscribers: (params?: any) =>
    HttpClient.get<any>(API_ENDPOINTS.VENDOR_SUBSCRIPTIONS_SUBSCRIBERS, params),
  history: (params?: any) =>
    HttpClient.get<any>(API_ENDPOINTS.VENDOR_SUBSCRIPTIONS_HISTORY, params),
};
