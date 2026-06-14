import { getLayout } from '@components/layout/layout';
import Container from '@components/ui/container';
import PageSellerBanner from '@components/ui/page-seller-banner';
import BecomeOwnerBlock from '@containers/become-owner-block';
import PageSellerDescription from '@components/ui/page-seller-description';
import PageSellerMoney from '@components/ui/page-seller-money';
import VendorFaqSection from '@components/devenir-vendeur/vendor-faq-section';
import SubscriptionPricingSection from '@components/devenir-vendeur/subscription-pricing-section';
import { useAtom } from 'jotai';
import { authorizationAtom } from '@store/authorization-atom';
import { useUI } from '@contexts/ui.context';
import { useSettings } from '@framework/settings';
import { useEffect, useState } from 'react';
import {
  SubscriptionPlan,
  VendorSubscriptionBillingPeriod,
} from '@type/index';
import {
  clearPendingSubscriptionCheckout,
  getAdminSubscriptionCheckoutUrl,
  getAdminVerifyEmailUrl,
  getPendingSubscriptionCheckout,
  markSubscriptionCheckoutPending,
  setSelectedSubscriptionPlan,
} from '@lib/subscription-plan-checkout';
import { useRouter } from 'next/router';
import { ROUTES } from '@lib/routes';
import client from '@framework/utils/index';
import axios from 'axios';
import { useToken } from '@lib/use-token';
import { toast } from 'react-toastify';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

function DevenirVendeur() {
  const router = useRouter();
  const [isAuthorized] = useAtom(authorizationAtom);
  const { setModalView, openModal, setModalData } = useUI();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { setEmailVerified } = useToken();
  const [
    isRedirectingToSubscriptionCheckout,
    setIsRedirectingToSubscriptionCheckout,
  ] = useState(false);

  useEffect(() => {
    if (!isAuthorized || settingsLoading) {
      return;
    }

    const pending = getPendingSubscriptionCheckout();
    if (!pending?.sellerFlow || !pending?.planId) {
      return;
    }

    let cancelled = false;

    async function continueSubscriptionFlow() {
      setIsRedirectingToSubscriptionCheckout(true);
      try {
        await client.vendorSubscriptions.me();
        if (!cancelled) {
          clearPendingSubscriptionCheckout();
          window.location.assign(
            getAdminSubscriptionCheckoutUrl(
              pending.planId,
              pending.billingPeriod ?? 'monthly'
            )
          );
        }
      } catch (error) {
        if (cancelled) return;
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          setEmailVerified(false);
          clearPendingSubscriptionCheckout();
          window.location.assign(getAdminVerifyEmailUrl());
          return;
        }
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          toast.error(
            "Ce compte n'est pas un compte vendeur. Creez un compte vendeur pour continuer."
          );
          clearPendingSubscriptionCheckout();
          return;
        }
        toast.error('Impossible de lancer le checkout abonnement.');
      } finally {
        if (!cancelled) {
          setIsRedirectingToSubscriptionCheckout(false);
        }
      }
    }

    continueSubscriptionFlow();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthorized,
    setEmailVerified,
    settingsLoading,
  ]);

  function handleSelectPlan(
    plan: SubscriptionPlan,
    billingPeriod: VendorSubscriptionBillingPeriod
  ) {
    setSelectedSubscriptionPlan(plan);
    markSubscriptionCheckoutPending({
      sellerFlow: true,
      planId: plan.id,
      billingPeriod,
    });

    if (!isAuthorized) {
      setModalData({
        sellerSubscriptionFlow: true,
        planId: plan.id,
        billingPeriod,
      });
      setModalView('LOGIN_VIEW');
      openModal();
      return;
    }

    setIsRedirectingToSubscriptionCheckout(true);
  }

  return (
    <>
      <PageSellerBanner pageBackground={'/assets/images/devenir-vendeur.jpg'} />

      <Container>
        <PageSellerDescription />
        <PageSellerMoney />
        <SubscriptionPricingSection
          onSelectPlan={handleSelectPlan}
          isSubmitting={isRedirectingToSubscriptionCheckout}
        />
        <VendorFaqSection />
      </Container>
      <BecomeOwnerBlock />
    </>
  );
}

export default DevenirVendeur;

DevenirVendeur.getLayout = getLayout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, [
      'common',
      'menu',
      'forms',
      'footer',
      'faq',
    ])),
  },
});
