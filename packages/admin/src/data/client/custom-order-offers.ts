import { CustomOrderOffer } from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const customOrderOffersClient = {
  create({
    conversationId,
    ...input
  }: {
    conversationId: string;
    product_id: string;
    negotiated_price: number;
    message?: string;
  }) {
    return HttpClient.post<CustomOrderOffer>(
      `${API_ENDPOINTS.CUSTOM_ORDER_OFFERS}/conversations/${conversationId}`,
      input
    );
  },
  findOne(id: string) {
    return HttpClient.get<CustomOrderOffer>(
      `${API_ENDPOINTS.CUSTOM_ORDER_OFFERS}/${id}`
    );
  },
};
