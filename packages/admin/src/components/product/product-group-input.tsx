import SelectInput from '@/components/ui/select-input';
import Label from '@/components/ui/label';
import ValidationError from '@/components/ui/form-validation-error';
import Button from '@/components/ui/button';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { useTypesQuery } from '@/data/type';
import { useRouter } from 'next/router';
import { useModalAction } from '@/components/ui/modal/modal.context';

interface Props {
  control: Control<any>;
  error: string | undefined;
  setValue?: any;
}

const ProductGroupInput = ({ control, error, setValue }: Props) => {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const selectedType = useWatch({
    control,
    name: 'type',
  });
  const { openModal } = useModalAction();
  const { types, loading } = useTypesQuery({
    limit: 200,
    language: locale,
  });
  return (
    <div className="mb-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Label className="mb-0">{t('form:input-label-group')}</Label>
        {setValue ? (
          <Button
            type="button"
            size="small"
            variant="outline"
            onClick={() => {
              openModal('CREATE_BRAND_INLINE', {
                onCreated: (created: any) => {
                  if (selectedType?.id === created?.id) return;
                  setValue('type', created, { shouldDirty: true });
                },
              });
            }}
          >
            + {t('form:button-label-add-group')}
          </Button>
        ) : null}
      </div>
      <SelectInput
        name="type"
        control={control}
        getOptionLabel={(option: any) => option.name}
        getOptionValue={(option: any) => option.id}
        options={types!}
        isLoading={loading}
      />
      <ValidationError message={t(error!)} />
    </div>
  );
};

export default ProductGroupInput;
