import SelectInput from '@/components/ui/select-input';
import Label from '@/components/ui/label';
import { Control, useFormState, useWatch } from 'react-hook-form';
import { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Button from '@/components/ui/button';
import { useCategoriesQuery } from '@/data/category';
import { useRouter } from 'next/router';
import { useModalAction } from '@/components/ui/modal/modal.context';

interface Props {
  control: Control<any>;
  setValue: any;
}

const ProductCategoryInput = ({ control, setValue }: Props) => {
  const { locale } = useRouter();
  const { t } = useTranslation('common');
  const type = useWatch({
    control,
    name: 'type',
  });
  const selectedCategories = useWatch({
    control,
    name: 'categories',
  });
  const { openModal } = useModalAction();
  const { dirtyFields } = useFormState({
    control,
  });
  useEffect(() => {
    if (type?.slug && dirtyFields?.type) {
      setValue('categories', []);
    }
  }, [type?.slug]);

  const { categories, loading } = useCategoriesQuery({
    limit: 999,
    type: type?.slug,
    language: locale,
  });

  return (
    <div className="mb-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Label className="mb-0">{t('form:input-label-categories')}</Label>
        <Button
          type="button"
          size="small"
          variant="outline"
          onClick={() => {
            openModal('CREATE_CATEGORY_INLINE', {
              onCreated: (created: any) => {
                const current = Array.isArray(selectedCategories)
                  ? selectedCategories
                  : [];
                setValue('categories', [...current, created], {
                  shouldDirty: true,
                });
              },
            });
          }}
        >
          + {t('form:button-label-add-category')}
        </Button>
      </div>
      <SelectInput
        name="categories"
        isMulti
        control={control}
        getOptionLabel={(option: any) => option.name}
        getOptionValue={(option: any) => option.id}
        // @ts-ignore
        options={categories}
        isLoading={loading}
      />
    </div>
  );
};

export default ProductCategoryInput;
