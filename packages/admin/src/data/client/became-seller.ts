import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const becameSellerClient = {
  all: ({ language }: { language: string }) =>
    HttpClient.get<any>(API_ENDPOINTS.BECAME_SELLER, { language }),

  update: ({ language, page_options }: { language?: string; page_options: any }) =>
    HttpClient.post<any>(API_ENDPOINTS.BECAME_SELLER, {
      language,
      page_options,
    }),
};

