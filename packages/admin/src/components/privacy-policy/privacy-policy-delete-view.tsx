import ConfirmationCard from '@/components/common/confirmation-card';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';
import { useDeletePrivacyPolicyMutation } from '@/data/privacy-policy';
import { getErrorMessage } from '@/utils/form-error';

const PrivacyPolicyDeleteView = () => {
  const { mutate: deleteById, isLoading: loading } = useDeletePrivacyPolicyMutation();
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

export default PrivacyPolicyDeleteView;
