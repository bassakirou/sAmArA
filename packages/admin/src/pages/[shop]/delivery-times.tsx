import Card from '@/components/common/card';
import Description from '@/components/ui/description';
import ErrorMessage from '@/components/ui/error-message';
import Input from '@/components/ui/input';
import Loader from '@/components/ui/loader/loader';
import TextArea from '@/components/ui/text-area';
import Button from '@/components/ui/button';
import ShopLayout from '@/components/layouts/shop';
import { useShopQuery, useUpdateShopMutation } from '@/data/shop';
import { adminOwnerAndStaffOnly, getAuthCredentials } from '@/utils/auth-utils';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useFieldArray, useForm } from 'react-hook-form';
import { DeliveryTimeInput } from '@/types';
import { toast } from 'react-toastify';

type FormValues = {
  deliveryTime: DeliveryTimeInput[];
};

export default function ShopDeliveryTimesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { shop } = router.query;
  const { data, isLoading, error } = useShopQuery(
    { slug: String(shop) },
    { enabled: Boolean(shop) }
  );
  const { permissions } = getAuthCredentials();

  const { mutateAsync: updateShop, isLoading: saving } = useUpdateShopMutation();

  const methods = useForm<FormValues>({
    shouldUnregister: false,
    defaultValues: {
      deliveryTime: (data?.settings as any)?.deliveryTime ?? [],
    },
  });

  const { control, register, handleSubmit, reset } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'deliveryTime',
  });

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  const onSubmit = async (values: FormValues) => {
    if (!data) return;
    try {
      await updateShop({
        id: data.id,
        name: data.name,
        settings: {
          ...(data.settings ?? {}),
          deliveryTime: values.deliveryTime,
        },
      } as any);
      reset(values);
    } catch (e: any) {
      const responseData = e?.response?.data;
      const validationMessage =
        responseData && typeof responseData === 'object' && !Array.isArray(responseData)
          ? (() => {
              const firstKey = Object.keys(responseData)[0];
              const firstValue = responseData?.[firstKey];
              if (Array.isArray(firstValue) && typeof firstValue?.[0] === 'string') {
                return firstValue[0];
              }
              return null;
            })()
          : null;

      const message =
        validationMessage ??
        responseData?.message ??
        (typeof e?.message === 'string' ? e.message : null);

      toast.error(message ?? t('common:something-went-wrong'));
    }
  };

  return (
    <>
      <div className="flex py-5 border-b border-dashed border-border-base sm:py-8">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:text-delivery-schedule')}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="my-5 flex flex-wrap border-b border-dashed border-gray-300 pb-8 sm:my-8">
          <Description
            title={t('form:text-delivery-schedule')}
            details={t('form:delivery-schedule-help-text')}
            className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
          />
          <Card className="w-full sm:w-8/12 md:w-2/3">
            <div>
              {fields.map((item: any & { id: string }, index: number) => (
                <div
                  className="border-b border-dashed border-border-200 py-5 first:pt-0 last:border-0 md:py-8"
                  key={item.id}
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                    <div className="grid grid-cols-1 gap-5 sm:col-span-4">
                      <Input
                        label={t('form:input-delivery-time-title')}
                        variant="outline"
                        {...register(`deliveryTime.${index}.title` as const)}
                        defaultValue={item?.title ?? ''}
                      />
                      <TextArea
                        label={t('form:input-delivery-time-description')}
                        variant="outline"
                        {...register(
                          `deliveryTime.${index}.description` as const
                        )}
                        defaultValue={item?.description ?? ''}
                      />
                    </div>
                    <button
                      onClick={() => remove(index)}
                      type="button"
                      className="text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none sm:col-span-1 sm:mt-4"
                    >
                      {t('form:button-label-remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                onClick={() => append({ title: '', description: '' })}
                className="w-full sm:w-auto"
              >
                {t('form:button-label-add-delivery-time')}
              </Button>
              <Button
                type="submit"
                loading={saving}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {t('common:text-save')}
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </>
  );
}

ShopDeliveryTimesPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
ShopDeliveryTimesPage.Layout = ShopLayout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
