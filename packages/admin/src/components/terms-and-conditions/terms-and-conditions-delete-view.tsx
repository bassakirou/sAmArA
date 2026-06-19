import ConfirmationCard from '@/components/common/confirmation-card';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';
import { useDeleteTermsAndConditionsMutation } from '@/data/terms-and-conditions';
import { getErrorMessage } from '@/utils/form-error';

const TermsAndConditionsDeleteView = () => {
  const { mutate: deleteById, isLoading: loading } = useDeleteTermsAndConditionsMutation();
  const { data } = useModalState();
  const { closeModal } = useModalAction();

  function handleDelete() {
    try {
      deleteById({ id: data });
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

export default TermsAndConditionsDeleteView;

