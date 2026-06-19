import { crudFactory } from '@/data/client/curd-factory';
import { SubscriptionPlan, SubscriptionPlanInput, SubscriptionPlanPaginator, SubscriptionPlanQueryOptions } from '@/types';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { HttpClient } from '@/data/client/http-client';

export const subscriptionPlanClient = {
  ...crudFactory<SubscriptionPlan, SubscriptionPlanQueryOptions, SubscriptionPlanInput>(
    API_ENDPOINTS.SUBSCRIPTION_PLANS
  ),
  get: ({ id }: { id: string }) =>
    HttpClient.get<SubscriptionPlan>(`${API_ENDPOINTS.SUBSCRIPTION_PLANS}/${id}`),
  update: ({ id, ...input }: Partial<SubscriptionPlanInput> & { id: string }) =>
    HttpClient.put<SubscriptionPlan>(`${API_ENDPOINTS.SUBSCRIPTION_PLANS}/${id}`, {
      id,
      ...input,
    }),
  active: (params?: Partial<SubscriptionPlanQueryOptions>) =>
    HttpClient.get<SubscriptionPlanPaginator>(API_ENDPOINTS.SUBSCRIPTION_PLANS_ACTIVE, params),
};
