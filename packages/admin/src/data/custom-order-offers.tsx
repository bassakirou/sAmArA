import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { customOrderOffersClient } from './client/custom-order-offers';

export const useCreateCustomOrderOffer = () => {
  const { t } = useTranslation();

  return useMutation(customOrderOffersClient.create, {
    onSuccess: () => {
      toast.success(t('Offre personnalisee envoyee.'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? t('Une erreur est survenue.'));
    },
  });
};
