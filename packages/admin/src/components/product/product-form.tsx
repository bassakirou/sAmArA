import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import Card from '@/components/common/card';
import Label from '@/components/ui/label';
import PopOver from '@/components/ui/popover';
import Radio from '@/components/ui/radio/radio';
import { useRouter } from 'next/router';
import { yupResolver } from '@hookform/resolvers/yup';
import FileInput from '@/components/ui/file-input';
import SelectInput from '@/components/ui/select-input';
import Checkbox from '@/components/ui/checkbox/checkbox';
import { productValidationSchema } from './product-validation-schema';
import ProductVariableForm from './product-variable-form';
import ProductSimpleForm from './product-simple-form';
import ProductGroupInput from './product-group-input';
import ProductCategoryInput from './product-category-input';
import ProductTypeInput from './product-type-input';
import { ProductType, Product, ProductStatus } from '@/types';
import { useTranslation } from 'next-i18next';
import { useShopQuery } from '@/data/shop';
import { useVendorSubscriptionStatusQuery } from '@/data/vendor-subscription';
import ProductTagInput from './product-tag-input';
import { Config } from '@/config';
import Alert from '@/components/ui/alert';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ProductAuthorInput from './product-author-input';
import ProductManufacturerInput from './product-manufacturer-input';
import { EditIcon } from '@/components/icons/edit';
import {
  getProductDefaultValues,
  getProductInputValues,
  ProductFormValues,
} from './form-utils';
import { getErrorMessage } from '@/utils/form-error';
import {
  useCreateProductInlineMutation,
  useCreateProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useUpdateProductInlineMutation,
} from '@/data/product';
import { split, join, isEmpty } from 'lodash';
import {
  adminOnly,
  getAuthCredentials,
  hasAccess,
  isStoreOwner,
  ownerOnly,
  isSuperAdmin,
} from '@/utils/auth-utils';
import { useSettingsQuery } from '@/data/settings';
import { useModalAction } from '@/components/ui/modal/modal.context';
import OpenAIButton from '@/components/openAI/openAI.button';
import { ItemProps } from '@/types';
import { toast } from 'react-toastify';
import { Routes } from '@/config/routes';
import { useQueryClient } from 'react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';

export const chatbotAutoSuggestion = ({ name }: { name: string }) => {
  return [
    {
      id: 1,
      title: `Write a product description about ${name} in 100 words or less that highlights the key benefits of the product.`,
    },
    {
      id: 2,
      title: `Create a product description about ${name} using HTML tags and include a product ID.`,
    },
    {
      id: 3,
      title: `Write a product description about ${name} using sensory language to appeal to the reader's senses.`,
    },
    {
      id: 4,
      title: `Create a product description about ${name} that includes customer reviews and ratings.`,
    },
    {
      id: 5,
      title: `Write a product description about ${name} using storytelling techniques to create an emotional connection with the reader.`,
    },
    {
      id: 6,
      title: `Write a product description about ${name} that compares and contrasts the product with similar products on the market.`,
    },
    {
      id: 7,
      title: `Create a product description about ${name} that highlights the product's sustainability and eco-friendliness.`,
    },
    {
      id: 8,
      title: `Write a product description about ${name} that includes a list of frequently asked questions and their answers.`,
    },
    {
      id: 9,
      title: `Create a product description about ${name} that includes a video demonstration of the product in use.`,
    },
    {
      id: 10,
      title: `Write a product description about ${name} that includes a call-to-action and encourages the reader to make a purchase.`,
    },
  ];
};

type ProductFormProps = {
  initialValues?: Product | null;
};

export default function CreateOrUpdateProductForm({
  initialValues,
}: ProductFormProps) {
  const router = useRouter();
  const { locale } = router;
  const {
    // @ts-ignore
    settings: { options },
  } = useSettingsQuery({
    language: locale!,
  });
  const [isSlugDisable, setIsSlugDisable] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState<boolean>(false);
  const { t } = useTranslation();
  const { openModal } = useModalAction();
  const queryClient = useQueryClient();
  const { permissions } = getAuthCredentials();
  const isSuperAdminUser = isSuperAdmin(permissions);
  const isOwner = isStoreOwner(permissions);
  let permission = hasAccess(adminOnly, permissions);
  let statusList = [
    {
      label: 'form:input-label-under-review',
      id: 'under_review',
      value: ProductStatus.UnderReview,
    },
    {
      label: 'form:input-label-draft',
      id: 'draft',
      value: ProductStatus.Draft,
    },
  ];

  const shopSlug = useMemo(() => {
    if (typeof router.query.shop === 'string') {
      return router.query.shop;
    }

    return (initialValues as any)?.shop?.slug ?? null;
  }, [initialValues, router.query.shop]);
  const { data: shopData, isLoading: shopDataLoading } = useShopQuery(
    { slug: shopSlug as string },
    {
      enabled: !!shopSlug,
    }
  );
  const {
    data: vendorSubscriptionStatus,
    isLoading: vendorSubscriptionStatusLoading,
  } = useVendorSubscriptionStatusQuery({
    enabled: isOwner,
  });
  const isPlanRestrictionsExempt = Boolean(
    shopData?.is_plan_restrictions_exempt ??
      (initialValues as any)?.shop?.is_plan_restrictions_exempt
  );
  const shopNegotiationPermission = shopData?.can_use_chat_negotiation;
  const vendorPlanCanUseNegotiation = useMemo(() => {
    if (isSuperAdminUser) return true;
    if (!isOwner) return undefined;
    if (isPlanRestrictionsExempt) return true;

    const trialEndsAt = vendorSubscriptionStatus?.trial_ends_at
      ? new Date(vendorSubscriptionStatus.trial_ends_at)
      : null;
    const trialActive =
      trialEndsAt && !Number.isNaN(trialEndsAt.getTime())
        ? Date.now() <= trialEndsAt.getTime()
        : false;
    const permissions = Array.isArray(
      vendorSubscriptionStatus?.active_subscription_plan?.permissions
    )
      ? vendorSubscriptionStatus.active_subscription_plan.permissions
      : [];

    return (
      trialActive ||
      permissions.includes('all') ||
      permissions.includes('chat_negotiation')
    );
  }, [
    isOwner,
    isPlanRestrictionsExempt,
    isSuperAdminUser,
    vendorSubscriptionStatus,
  ]);
  const shopCanUseNegotiation =
    vendorPlanCanUseNegotiation ??
    shopNegotiationPermission ??
    (initialValues as any)?.shop?.can_use_chat_negotiation ??
    isPlanRestrictionsExempt;
  const shopPermissionLoading =
    !isSuperAdminUser &&
    !isPlanRestrictionsExempt &&
    ((isOwner && vendorSubscriptionStatusLoading) ||
      (!!shopSlug &&
        shopDataLoading &&
        shopNegotiationPermission === undefined));
  const shopId = shopData?.id ?? initialValues?.shop_id;
  const isNewTranslation = router?.query?.action === 'translate';
  const isSlugEditable =
    router?.query?.action === 'edit' &&
    router?.locale === Config.defaultLanguage;
  const methods = useForm<ProductFormValues>({
    resolver: yupResolver(productValidationSchema),
    shouldUnregister: true,
    // @ts-ignore
    defaultValues: getProductDefaultValues(initialValues!, isNewTranslation),
  });
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    watch,
    getValues,
    reset,
    formState,
  } = methods;
  const { errors, isDirty } = formState;

  // const upload_max_filesize = options?.server_info?.upload_max_filesize / 1024;
  const upload_max_filesize = 5;

  const { mutateAsync: createProduct, isLoading: creating } =
    useCreateProductMutation();
  const { mutateAsync: updateProduct, isLoading: updating } =
    useUpdateProductMutation();
  const product_type = watch('product_type');
  const is_digital = watch('is_digital');
  const is_external = watch('is_external');
  const isNegotiable = watch('is_negotiable');
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'video',
  });
  const videoSourceOptions = useMemo(
    () => [
      { label: t('form:video-source-youtube'), value: 'youtube' },
      { label: t('form:video-source-vimeo'), value: 'vimeo' },
      { label: t('form:video-source-external'), value: 'external' },
      { label: t('form:video-source-upload'), value: 'upload' },
    ],
    [t]
  );
  const productName = watch('name');

  const autoSuggestionList = useMemo(() => {
    return chatbotAutoSuggestion({ name: productName ?? '' });
  }, [productName]);
  const canUseNegotiation = useMemo(() => {
    if (!shopSlug && !initialValues?.shop_id) return true;
    return Boolean(shopCanUseNegotiation);
  }, [initialValues?.shop_id, shopCanUseNegotiation, shopSlug]);
  const negotiationBlockedByPlan = !shopPermissionLoading && !canUseNegotiation;
  const negotiationDisabled = shopPermissionLoading || negotiationBlockedByPlan;

  const draftStorageKey = useMemo(() => {
    const shop =
      typeof router.query.shop === 'string' ? router.query.shop : null;
    const locale = router.locale ?? 'fr';
    return `samara:product-draft:${shop ?? 'admin'}:${locale}`;
  }, [router.locale, router.query.shop]);

  const [localDraftCandidate, setLocalDraftCandidate] = useState<any | null>(
    null
  );
  const [draftServerId, setDraftServerId] = useState<number | null>(null);

  useEffect(() => {
    if (!negotiationBlockedByPlan || !isNegotiable) return;
    setValue('is_negotiable', false, { shouldDirty: true });
  }, [isNegotiable, negotiationBlockedByPlan, setValue]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialValues) return;
    const raw = window.localStorage.getItem(draftStorageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setLocalDraftCandidate(parsed);
    } catch {}
  }, [draftStorageKey, initialValues, isNewTranslation, reset, t]);

  const { mutateAsync: createDraft } = useCreateProductInlineMutation();
  const { mutateAsync: updateDraft } = useUpdateProductInlineMutation();
  const { mutateAsync: deleteDraft, isLoading: deletingDraft } =
    useDeleteProductMutation();

  const onSubmit = async (values: ProductFormValues) => {
    const currentStatus = initialValues?.status ?? values.status;
    const isDraftLike =
      !initialValues ||
      currentStatus === ProductStatus.Draft ||
      currentStatus === ProductStatus.UnderReview ||
      currentStatus === ProductStatus.Rejected;

    const normalizedValues: ProductFormValues =
      !permission && isDraftLike && values.status === ProductStatus.Publish
        ? { ...values, status: ProductStatus.UnderReview }
        : values;

    const inputValues = {
      language: router.locale,
      ...getProductInputValues(normalizedValues, initialValues),
    };

    try {
      setIsSubmittingFinal(true);

      if (!initialValues && draftServerId) {
        const createdOrUpdated = await updateDraft({
          ...inputValues,
          id: draftServerId,
          shop_id: shopId,
        } as any);

        clearLocalDraft();
        setDraftServerId(null);

        const generateRedirectUrl = router.query.shop
          ? `/${router.query.shop}${Routes.product.list}`
          : Routes.product.list;
        await router.push(generateRedirectUrl, undefined, {
          locale: Config.defaultLanguage,
        });

        const status = (createdOrUpdated as any)?.status;
        if (String(status ?? '').toLowerCase() === 'draft') {
          toast.info(t('form:input-label-draft'));
        } else if (String(status ?? '').toLowerCase() === 'under_review') {
          toast.success(t('common:product-sent-for-review'));
        } else {
          toast.success(t('common:successfully-created'));
        }
        return;
      }

      if (initialValues?.id) {
        //@ts-ignore
        await updateProduct({
          ...inputValues,
          id: initialValues.id!,
          shop_id: initialValues.shop_id!,
        });
        if (
          !permission &&
          isDraftLike &&
          values.status === ProductStatus.Publish &&
          normalizedValues.status === ProductStatus.UnderReview
        ) {
          toast.success(t('common:product-sent-for-review'));
        }
      } else {
        //@ts-ignore
        await createProduct({
          ...inputValues,
          shop_id: shopId || initialValues?.shop_id,
        });
        if (
          !permission &&
          values.status === ProductStatus.Publish &&
          normalizedValues.status === ProductStatus.UnderReview
        ) {
          toast.success(t('common:product-sent-for-review'));
        }
      }
    } catch (error) {
      const serverErrors = getErrorMessage(error);
      Object.keys(serverErrors?.validation).forEach((field: any) => {
        setError(field.split('.')[1], {
          type: 'manual',
          message: serverErrors?.validation[field][0],
        });
      });
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  const clearLocalDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(draftStorageKey);
    } catch {}
    setLocalDraftCandidate(null);
  }, [draftStorageKey]);

  const restoreLocalDraft = useCallback(() => {
    if (!localDraftCandidate) return;
    reset({
      ...getProductDefaultValues(initialValues as any, isNewTranslation),
      ...localDraftCandidate,
    });
    setLocalDraftCandidate(null);
    toast.info(t('common:draft-restored'));
  }, [initialValues, isNewTranslation, localDraftCandidate, reset, t]);

  const saveLocalDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (initialValues) return;
    try {
      const values = getValues();
      window.localStorage.setItem(draftStorageKey, JSON.stringify(values));
    } catch {}
  }, [draftStorageKey, getValues, initialValues]);

  const saveDraftToServer = useCallback(
    async (withToast = false) => {
      if (isSubmittingFinal) return;
      if (initialValues) return;
      const ok = await methods.trigger(['name', 'product_type', 'unit']);
      if (!ok) return;

      try {
        const inputValues = {
          ...getProductInputValues(getValues(), initialValues),
          language: router.locale,
          shop_id: shopId,
          status: ProductStatus.Draft,
        };

        const createdOrUpdated = draftServerId
          ? await updateDraft({
              ...inputValues,
              id: draftServerId,
            } as any)
          : await createDraft(inputValues as any);

        if (!draftServerId) {
          setDraftServerId((createdOrUpdated as any)?.id ?? null);
        }

        clearLocalDraft();
        if (withToast) {
          toast.success(t('common:draft-saved'));
        }
      } catch (error: any) {
        if (!withToast) return;
        const data = error?.response?.data;
        const firstKey =
          data && typeof data === 'object' ? Object.keys(data)[0] : null;
        const firstValue = firstKey ? (data as any)[firstKey] : null;
        const message = Array.isArray(firstValue)
          ? firstValue[0]
          : typeof firstValue === 'string'
          ? firstValue
          : null;
        toast.error(message ?? t('common:inline-create-failed'));
      }
    },
    [
      clearLocalDraft,
      createDraft,
      draftServerId,
      getValues,
      isSubmittingFinal,
      initialValues,
      methods,
      router.locale,
      shopId,
      t,
      updateDraft,
    ]
  );

  const deleteDraftEverywhere = useCallback(async () => {
    if (initialValues) return;
    clearLocalDraft();
    if (draftServerId) {
      await deleteDraft({ id: draftServerId } as any);
      setDraftServerId(null);
    }
    reset(
      getProductDefaultValues(initialValues as any, isNewTranslation) as any
    );
  }, [
    clearLocalDraft,
    deleteDraft,
    draftServerId,
    initialValues,
    isNewTranslation,
    reset,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialValues) return;
    if (!isDirty) return;
    if (isSubmittingFinal) return;
    const id = window.setInterval(() => {
      saveLocalDraft();
    }, 30000);
    return () => window.clearInterval(id);
  }, [initialValues, isDirty, isSubmittingFinal, saveLocalDraft]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialValues) return;
    if (!isDirty) return;
    if (isSubmittingFinal) return;
    const id = window.setInterval(() => {
      saveDraftToServer(false);
    }, 30000);
    return () => window.clearInterval(id);
  }, [initialValues, isDirty, isSubmittingFinal, saveDraftToServer]);

  const handleGenerateDescription = useCallback(() => {
    openModal('GENERATE_DESCRIPTION', {
      control,
      name: productName,
      set_value: setValue,
      key: 'description',
      suggestion: autoSuggestionList as ItemProps[],
    });
  }, [productName]);

  const slugAutoSuggest = join(split(watch('name'), ' '), '-').toLowerCase();
  if (Boolean(options?.isProductReview)) {
    if (permission) {
      statusList = [
        {
          label: 'form:input-label-published',
          id: 'published',
          value: ProductStatus.Publish,
        },
        {
          label: 'form:input-label-approved',
          id: 'approved',
          value: ProductStatus.Approved,
        },
        {
          label: 'form:input-label-rejected',
          id: 'rejected',
          value: ProductStatus.Rejected,
        },
        {
          label: 'form:input-label-soft-disabled',
          id: 'unpublish',
          value: ProductStatus.UnPublish,
        },
        {
          label: 'form:input-label-under-review',
          id: 'under_review',
          value: ProductStatus.UnderReview,
        },
        {
          label: 'form:input-label-draft',
          id: 'draft',
          value: ProductStatus.Draft,
        },
      ];
    } else {
      if (
        initialValues?.status === ProductStatus.Publish ||
        initialValues?.status === ProductStatus.Approved ||
        initialValues?.status === ProductStatus.UnPublish
      ) {
        {
          statusList = [
            {
              label: 'form:input-label-published',
              id: 'published',
              value: ProductStatus.Publish,
            },
            {
              label: 'form:input-label-unpublish',
              id: 'unpublish',
              value: ProductStatus.UnPublish,
            },
          ];
        }
      }
    }
  } else {
    statusList = [
      {
        label: 'form:input-label-published',
        id: 'published',
        value: ProductStatus.Publish,
      },
      {
        label: 'form:input-label-draft',
        id: 'draft',
        value: ProductStatus.Draft,
      },
    ];
  }

  const featuredImageInformation = (
    <span>
      {t('form:featured-image-help-text')} <br />
      {t('form:size-help-text')} &nbsp;
      <span className="font-bold">{upload_max_filesize} MB </span>
    </span>
  );

  const galleryImageInformation = (
    <span>
      {t('form:gallery-help-text')} <br />
      {t('form:size-help-text')} &nbsp;
      <span className="font-bold">{upload_max_filesize} MB </span>
    </span>
  );

  return (
    <>
      {errorMessage ? (
        <Alert
          message={t(`common:${errorMessage}`)}
          variant="error"
          closeable={true}
          className="mt-5"
          onClose={() => setErrorMessage(null)}
        />
      ) : null}
      {localDraftCandidate && !initialValues && !draftServerId ? (
        <div className="mt-5 rounded border border-border-base bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-body">{t('common:draft-found')}</div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={clearLocalDraft}>
                {t('form:button-label-ignore-draft')}
              </Button>
              <Button type="button" onClick={restoreLocalDraft}>
                {t('form:button-label-restore-draft')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
            <Description
              title={t('form:featured-image-title')}
              details={featuredImageInformation}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FileInput name="image" control={control} multiple={false} />
              {/* {errors.image?.message && (
                <p className="my-2 text-xs text-red-500">
                  {t(errors?.image?.message!)}
                </p>
              )} */}
            </Card>
          </div>

          <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
            <Description
              title={t('form:gallery-title')}
              details={galleryImageInformation}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FileInput name="gallery" control={control} />
            </Card>
          </div>

          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
            <Description
              title={t('form:video-title')}
              details={t('form:video-help-text')}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <div>
                {fields.map((item: any, index: number) => {
                  const source = watch(`video.${index}.source`);
                  const resolvedSource =
                    item?.source ??
                    videoSourceOptions.find(
                      (opt) => opt.value === (item?.type ?? item?.source?.value)
                    ) ??
                    videoSourceOptions[0];
                  const sourceValue =
                    source?.value ?? source ?? resolvedSource.value;
                  return (
                    <div
                      className="py-5 border-b border-dashed border-border-200 first:pt-0 last:border-b-0 md:py-8 md:first:pt-0"
                      key={index}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="mb-3 text-sm font-semibold leading-none text-body-dark">
                          {t('form:video-title')}
                        </div>
                        <button
                          onClick={() => {
                            remove(index);
                          }}
                          type="button"
                          className="text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none"
                        >
                          {t('form:button-label-remove')}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                        <div className="sm:col-span-2">
                          <Label>{t('form:input-label-video-source')}</Label>
                          <SelectInput
                            name={`video.${index}.source`}
                            control={control}
                            options={videoSourceOptions}
                            defaultValue={resolvedSource}
                          />
                        </div>

                        {sourceValue === 'upload' ? (
                          <div className="sm:col-span-3">
                            <Label>{t('form:input-label-video-upload')}</Label>
                            <FileInput
                              name={`video.${index}.file`}
                              control={control}
                              multiple={false}
                              acceptFile={true}
                              accept="video/*"
                              helperText={t('form:text-upload-video')}
                              defaultValue={
                                item?.file ??
                                (item?.type === 'upload' && item?.url
                                  ? {
                                      original: item.url,
                                      thumbnail: item.url,
                                      id: item?.attachment_id,
                                    }
                                  : {})
                              }
                            />
                            {errors?.video?.[index]?.file?.message && (
                              <p className="my-2 text-xs text-red-500">
                                {t(
                                  errors?.video?.[index]?.file?.message as any
                                )}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="sm:col-span-3">
                            <Input
                              label={t('form:input-label-video-url')}
                              type="url"
                              {...register(`video.${index}.url` as const)}
                              defaultValue={item?.url!}
                              error={t(
                                errors?.video?.[index]?.url?.message as any
                              )}
                              variant="outline"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                onClick={() => {
                  append({
                    source: videoSourceOptions[0],
                    url: '',
                  });
                }}
                className="w-full sm:w-auto"
                disabled={fields.length >= 1}
              >
                {t('form:button-label-add-video')}
              </Button>
            </Card>
          </div>

          <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
            <Description
              title={t('form:type-and-category')}
              details={t('form:type-and-category-help-text')}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <ProductGroupInput
                control={control}
                error={t((errors?.type as any)?.message)}
                setValue={setValue}
              />
              <ProductCategoryInput control={control} setValue={setValue} />
              {/* it's not needed in chawkbazar */}
              {/* <ProductAuthorInput control={control} /> */}
              {/* <ProductManufacturerInput control={control} setValue={setValue} /> */}
              <ProductTagInput control={control} setValue={setValue} />
            </Card>
          </div>

          <div className="my-5 flex flex-wrap sm:my-8">
            <Description
              title={t('form:item-description')}
              details={`${
                initialValues
                  ? t('form:item-description-edit')
                  : t('form:item-description-add')
              } ${t('form:product-description-help-text')}`}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <Input
                label={`${t('form:input-label-name')}*`}
                {...register('name')}
                error={t(errors.name?.message!)}
                variant="outline"
                className="mb-5"
              />

              {isSlugEditable ? (
                <div className="relative mb-5">
                  <Input
                    label={`${t('Slug')}`}
                    {...register('slug')}
                    error={t(errors.slug?.message!)}
                    variant="outline"
                    disabled={isSlugDisable}
                  />
                  <button
                    className="absolute top-[27px] right-px z-10 flex h-[46px] w-11 items-center justify-center rounded-tr rounded-br border-l border-solid border-border-base bg-white px-2 text-body transition duration-200 hover:text-heading focus:outline-none"
                    type="button"
                    title={t('common:text-edit')}
                    onClick={() => setIsSlugDisable(false)}
                  >
                    <EditIcon width={14} />
                  </button>
                </div>
              ) : (
                <Input
                  label={`${t('Slug')}`}
                  {...register('slug')}
                  value={slugAutoSuggest}
                  variant="outline"
                  className="mb-5"
                  disabled
                />
              )}
              <Input
                label={`${t('form:input-label-unit')}*`}
                {...register('unit')}
                error={t(errors.unit?.message!)}
                placeholder={t('form:input-placeholder-unit')}
                note={t('form:input-note-unit')}
                list="unit-options"
                variant="outline"
                className="mb-5"
              />
              <datalist id="unit-options">
                {[
                  'pièce',
                  'kg',
                  'g',
                  'mg',
                  'litre',
                  'ml',
                  'm',
                  'cm',
                  'mm',
                  'pack',
                  'boîte',
                  'lot',
                ].map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
              <div className="relative">
                {options?.useAi && (
                  <OpenAIButton
                    title="Generate Description With AI"
                    onClick={handleGenerateDescription}
                  />
                )}
                <TextArea
                  label={t('form:input-label-description')}
                  {...register('description')}
                  error={t(errors.description?.message!)}
                  variant="outline"
                  className="mb-5"
                />
              </div>

              <div>
                <Label>{t('form:input-label-status')}</Label>
                {!isEmpty(statusList)
                  ? statusList?.map((status: any, index: number) => (
                      <Radio
                        key={index}
                        {...register('status')}
                        label={t(status?.label)}
                        id={status?.id}
                        value={status?.value}
                        className="mb-2"
                        disabled={false}
                      />
                    ))
                  : ''}
                {errors.status?.message && (
                  <p className="my-2 text-xs text-red-500">
                    {t(errors?.status?.message!)}
                  </p>
                )}
              </div>

              <div className="mt-5">
                <div className="mb-5 flex items-center gap-2">
                  <Checkbox
                    {...register('is_negotiable')}
                    label={t('form:input-label-is-negotiable')}
                    className="mb-0"
                    disabled={negotiationDisabled}
                  />
                  {negotiationBlockedByPlan ? (
                    <PopOver
                      iconStyle="vertical"
                      popOverButtonClass="!p-0 text-amber-500 hover:text-amber-600"
                      popOverPanelClass="!w-[20rem] rounded bg-white px-4 py-3 text-sm leading-6 text-body shadow-card"
                    >
                      <div className="px-1 py-1">
                        Impossible d&apos;activer la negociation du prix: votre
                        plan d&apos;abonnement ne permet pas l&apos;acces au
                        chat de negociation.
                      </div>
                    </PopOver>
                  ) : null}
                </div>
              </div>
            </Card>
          </div>

          <div className="my-5 flex flex-wrap border-b border-dashed border-border-base pb-8 sm:my-8">
            <Description
              title={t('form:form-title-product-type')}
              details={t('form:form-description-product-type')}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pr-4 md:w-1/3 md:pr-5"
            />

            <ProductTypeInput />
          </div>

          {/* Simple Type */}
          {product_type?.value === ProductType.Simple && (
            <ProductSimpleForm initialValues={initialValues} />
          )}

          {/* Variation Type */}
          {product_type?.value === ProductType.Variable && (
            <ProductVariableForm
              shopId={shopId}
              initialValues={initialValues}
              settings={options}
            />
          )}

          <div className="mb-4 text-end">
            {initialValues && (
              <Button
                variant="outline"
                onClick={async () => {
                  await queryClient.invalidateQueries(API_ENDPOINTS.PRODUCTS);
                  const generateRedirectUrl = router.query.shop
                    ? `/${router.query.shop}${Routes.product.list}`
                    : Routes.product.list;
                  await router.push(generateRedirectUrl, undefined, {
                    locale: Config.defaultLanguage,
                  });
                }}
                className="me-4"
                type="button"
              >
                {t('form:button-label-back')}
              </Button>
            )}
            {!initialValues ? (
              <>
                {draftServerId || isDirty ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="me-4"
                    loading={deletingDraft}
                    onClick={deleteDraftEverywhere}
                  >
                    {t('form:button-label-delete-draft')}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  className="me-4"
                  onClick={() => saveDraftToServer(true)}
                >
                  {t('form:button-label-save-draft')}
                </Button>
              </>
            ) : null}
            <Button loading={updating || creating}>
              {initialValues
                ? t('form:button-label-update-product')
                : t('form:button-label-add-product')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </>
  );
}
