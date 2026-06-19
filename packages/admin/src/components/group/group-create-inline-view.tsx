import Card from '@/components/common/card';
import CreateOrUpdateTypeForm from '@/components/group/group-form';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';

const GroupCreateInlineView = () => {
  const { data } = useModalState();
  const { closeModal } = useModalAction();

  return (
    <div className="w-[95vw] max-w-5xl">
      <Card className="p-5">
        <CreateOrUpdateTypeForm
          onCreated={(created) => {
            data?.onCreated?.(created);
            closeModal();
          }}
        />
      </Card>
    </div>
  );
};

export default GroupCreateInlineView;
