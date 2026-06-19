import Button from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useUpdateBecameSellerMutation } from '@/data/became-seller';
import BannerEditor from '@/components/page-sections/become-seller/banner-editor';
import SellingStepsEditor from '@/components/page-sections/become-seller/selling-steps-editor';
import PurposeEditor from '@/components/page-sections/become-seller/purpose-editor';
import UserStoryEditor from '@/components/page-sections/become-seller/user-story-editor';
import CommissionEditor from '@/components/page-sections/become-seller/commission-editor';
import DashboardEditor from '@/components/page-sections/become-seller/dashboard-editor';
import GuidelineEditor from '@/components/page-sections/become-seller/guideline-editor';
import FaqEditor from '@/components/page-sections/become-seller/faq-editor';
import ContactEditor from '@/components/page-sections/become-seller/contact-editor';
import SellerOpportunityEditor from '@/components/page-sections/become-seller/seller-opportunity-editor';
import { normalizeBecomeSellerSections } from '@/components/page-sections/become-seller/utils';

type Props = {
  initialValues?: any;
};

export default function BecameSellerForm({ initialValues }: Props) {
  const { locale } = useRouter();
  const { mutate: saveBecomeSeller, isLoading } = useUpdateBecameSellerMutation();
  const { register, control, handleSubmit } = useForm<any>({
    defaultValues: {
      sections: normalizeBecomeSellerSections(initialValues),
    },
  });

  const onSubmit = (values: any) => {
    saveBecomeSeller({
      language: locale,
      page_options: {
        sections: values.sections,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <BannerEditor control={control} register={register} />
      <SellingStepsEditor control={control} register={register} />
      <PurposeEditor control={control} register={register} />
      <UserStoryEditor control={control} register={register} />
      <CommissionEditor control={control} register={register} />
      <DashboardEditor control={control} register={register} />
      <GuidelineEditor control={control} register={register} />
      <FaqEditor control={control} register={register} />
      <ContactEditor control={control} register={register} />
      <SellerOpportunityEditor control={control} register={register} />

      <div className="mb-10 text-end">
        <Button loading={isLoading} disabled={isLoading}>
          Enregistrer la page Become Seller
        </Button>
      </div>
    </form>
  );
}
