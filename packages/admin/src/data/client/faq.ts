import { crudFactory } from '@/data/client/curd-factory';
import {
  CreateFaqInput,
  Faq,
  FaqPaginator,
  FaqQueryOptions,
  QueryOptions,
} from '@/types';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { HttpClient } from '@/data/client/http-client';

export const faqClient = {
  ...crudFactory<Faq, QueryOptions, CreateFaqInput>(API_ENDPOINTS.FAQS),
  paginated: ({ title, type, ...params }: Partial<FaqQueryOptions>) => {
    return HttpClient.get<FaqPaginator>(API_ENDPOINTS.FAQS, {
      searchJoin: 'and',
      ...params,
      search: HttpClient.formatSearchParams({ title, type } as any),
    });
  },
};
