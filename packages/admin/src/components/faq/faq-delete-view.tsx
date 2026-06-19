import ConfirmationCard from '@/components/common/confirmation-card';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';
import { useDeleteFaqMutation } from '@/data/faq';
import { getErrorMessage } from '@/utils/form-error';

const FaqDeleteView = () => {
  const { mutate: deleteFaqById, isLoading: loading } = useDeleteFaqMutation();
  const { data } = useModalState();
  const { closeModal } = useModalAction();

  function handleDelete() {
    try {
      deleteFaqById({ id: data });
      closeModal();
    } catch (error) {
      closeModal();
      getErrorMessage(error);
    }
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading}
    />
  );
};

export default FaqDeleteView;

