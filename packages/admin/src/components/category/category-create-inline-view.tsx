import Card from '@/components/common/card';
import CreateOrUpdateCategoriesForm from '@/components/category/category-form';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';

const CategoryCreateInlineView = () => {
  const { data } = useModalState();
  const { closeModal } = useModalAction();

  return (
    <div className="w-[95vw] max-w-5xl">
      <Card className="p-5">
        <CreateOrUpdateCategoriesForm
          onCreated={(created) => {
            data?.onCreated?.(created);
            closeModal();
          }}
        />
      </Card>
    </div>
  );
};

export default CategoryCreateInlineView;
