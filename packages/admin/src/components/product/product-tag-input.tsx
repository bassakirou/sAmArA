import SelectInput from '@/components/ui/select-input';
import Label from '@/components/ui/label';
import { Control, useWatch } from 'react-hook-form';
import Button from '@/components/ui/button';
import { useTagsQuery } from '@/data/tag';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useModalAction } from '@/components/ui/modal/modal.context';

interface Props {
  control: Control<any>;
  setValue: any;
}

const ProductTagInput = ({ control, setValue }: Props) => {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const type = useWatch({
    control,
    name: 'type',
  });
  const selectedTags = useWatch({
    control,
    name: 'tags',
  });
  const { openModal } = useModalAction();

  const { tags, loading } = useTagsQuery({
    limit: 999,
    language: locale,
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Label className="mb-0">{t('sidebar-nav-item-tags')}</Label>
        <Button
          type="button"
          size="small"
          variant="outline"
          onClick={() => {
            openModal('CREATE_TAG_INLINE', {
              onCreated: (created: any) => {
                const current = Array.isArray(selectedTags) ? selectedTags : [];
                setValue('tags', [...current, created], { shouldDirty: true });
              },
            });
          }}
        >
          + {t('form:button-label-add-tag')}
        </Button>
      </div>
      <SelectInput
        name="tags"
        isMulti
        control={control}
        getOptionLabel={(option: any) => option.name}
        getOptionValue={(option: any) => option.id}
        // @ts-ignore
        options={tags}
        isLoading={loading}
      />
    </div>
  );
};

export default ProductTagInput;
