import Card from '@/components/common/card';
import CreateOrUpdateTagForm from '@/components/tag/tag-form';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';

const TagCreateInlineView = () => {
  const { data } = useModalState();
  const { closeModal } = useModalAction();

  return (
    <div className="w-[95vw] max-w-5xl">
      <Card className="p-5">
        <CreateOrUpdateTagForm
          onCreated={(created) => {
            data?.onCreated?.(created);
            closeModal();
          }}
        />
      </Card>
    </div>
  );
};

export default TagCreateInlineView;
