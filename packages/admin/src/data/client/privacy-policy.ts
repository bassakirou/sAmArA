import { crudFactory } from '@/data/client/curd-factory';
import {
  CreatePrivacyPolicyInput,
  QueryOptions,
  PrivacyPolicy,
  PrivacyPolicyPaginator,
  PrivacyPolicyQueryOptions,
} from '@/types';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { HttpClient } from '@/data/client/http-client';

export const privacyPoliciesClient = {
  ...crudFactory<PrivacyPolicy, QueryOptions, CreatePrivacyPolicyInput>(
    API_ENDPOINTS.PRIVACY_POLICIES
  ),
  paginated: ({ title, ...params }: Partial<PrivacyPolicyQueryOptions>) => {
    return HttpClient.get<PrivacyPolicyPaginator>(
      API_ENDPOINTS.PRIVACY_POLICIES,
      {
        searchJoin: 'and',
        ...params,
        search: HttpClient.formatSearchParams({ title } as any),
      }
    );
  },
};
