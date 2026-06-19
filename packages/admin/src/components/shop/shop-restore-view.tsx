import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import { useRestoreShopMutation } from '@/data/shop';
import { getErrorMessage } from '@/utils/form-error';

const ShopRestoreView = () => {
  const { mutate: restoreShopById, isLoading: loading } = useRestoreShopMutation();

  const { data } = useModalState();
  const { closeModal } = useModalAction();

  function handleRestore() {
    try {
      restoreShopById({ id: data });
      closeModal();
    } catch (error) {
      closeModal();
      getErrorMessage(error);
    }
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleRestore}
      deleteBtnLoading={loading}
      title="Restaurer la boutique"
      description="Êtes-vous sûr de vouloir restaurer cette boutique ?"
      cancelBtnText="Annuler"
      deleteBtnText="Restaurer"
      cancelBtnClassName="bg-gray-200"
      deleteBtnClassName="bg-accent"
    />
  );
};

export default ShopRestoreView;