import { getLayout } from '@components/layout/layout';
import PageHeader from '@components/ui/page-header';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { QueryClient } from 'react-query';
import { API_ENDPOINTS } from '@framework/utils/endpoints';
import client from '@framework/utils/index';
import BannerSection from '@components/page-sections/become-seller/banner-section';
import SellingStepsSection from '@components/page-sections/become-seller/selling-steps-section';
import PurposeSection from '@components/page-sections/become-seller/purpose-section';
import UserStorySection from '@components/page-sections/become-seller/user-story-section';
import CommissionSection from '@components/page-sections/become-seller/commission-section';
import DashboardSection from '@components/page-sections/become-seller/dashboard-section';
import GuidelineSection from '@components/page-sections/become-seller/guideline-section';
import FaqSection from '@components/page-sections/become-seller/faq-section';
import ContactSection from '@components/page-sections/become-seller/contact-section';
import SellerOpportunitySection from '@components/page-sections/become-seller/seller-opportunity-section';
import { getOrderedBecomeSellerSections, getSellerRegisterUrl } from '@components/page-sections/become-seller/utils';

const SECTION_COMPONENTS: Record<string, any> = {
  banner: BannerSection,
  sellingSteps: SellingStepsSection,
  purpose: PurposeSection,
  userStory: UserStorySection,
  commission: CommissionSection,
  dashboard: DashboardSection,
  guideline: GuidelineSection,
  faq: FaqSection,
  contact: ContactSection,
  sellerOpportunity: SellerOpportunitySection,
};

export default function BecomeSellerPage({ data }: { data: any }) {
  const registerUrl = getSellerRegisterUrl();
  const sections = getOrderedBecomeSellerSections(data?.page_options);

  return (
    <>
      <PageHeader pageHeader="Devenir vendeur" />
      <div className="bg-slate-50 pb-20">
        {sections.map((section: any) => {
          const Component = SECTION_COMPONENTS[section?.meta?.id];
          if (!Component) {
            return null;
          }
          return (
            <Component
              key={section.meta.id}
              data={section.data}
              registerUrl={registerUrl}
            />
          );
        })}
      </div>
    </>
  );
}

BecomeSellerPage.getLayout = getLayout;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(API_ENDPOINTS.SETTINGS, () =>
    client.settings.findAll()
  );

  const data = await client.becomeSeller.findAll({
    language: locale!,
  });

  return {
    props: {
      data: data ?? null,
      ...(await serverSideTranslations(locale!, [
        'common',
        'menu',
        'forms',
        'footer',
      ])),
    },
  };
};
