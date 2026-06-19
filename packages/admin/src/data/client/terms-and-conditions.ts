import { crudFactory } from '@/data/client/curd-factory';
import {
  CreateTermsAndConditionInput,
  QueryOptions,
  TermsAndCondition,
  TermsAndConditionPaginator,
  TermsAndConditionQueryOptions,
} from '@/types';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { HttpClient } from '@/data/client/http-client';

export const termsAndConditionsClient = {
  ...crudFactory<TermsAndCondition, QueryOptions, CreateTermsAndConditionInput>(
    API_ENDPOINTS.TERMS_AND_CONDITIONS
  ),
  paginated: ({ title, ...params }: Partial<TermsAndConditionQueryOptions>) => {
    return HttpClient.get<TermsAndConditionPaginator>(
      API_ENDPOINTS.TERMS_AND_CONDITIONS,
      {
        searchJoin: 'and',
        ...params,
        search: HttpClient.formatSearchParams({ title } as any),
      }
    );
  },
};
