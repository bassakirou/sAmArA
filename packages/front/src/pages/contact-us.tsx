import Container from '@components/ui/container';
import { getLayout } from '@components/layout/layout';
import PageHeader from '@components/ui/page-header';
import ContactForm from '@components/common/form/contact-form';
import ContactInfoBlock from '@containers/contact-info';
import { useTranslation } from 'next-i18next';

export { getStaticProps } from '@framework/common.ssr';

export default function ContactUsPage() {
  const { t } = useTranslation('common');
  return (
    <>
      <PageHeader pageHeader="text-page-contact-us" />
      <Container>
        <div className="flex flex-col w-full px-0 pb-2 mx-auto my-14 lg:my-16 xl:my-20 lg: xl:max-w-screen-xl md:flex-row">
          <div className="flex flex-col h-full md:w-full lg:w-2/5 2xl:w-2/6">
            <ContactInfoBlock />
          </div>
          <div className="flex flex-col h-full md:w-full lg:w-3/5 2xl:w-4/6 ltr:md:ml-7 rtl:md:mr-7 ltr:lg:pl-7 rtl:lg:pr-7">
            <div className="flex pb-7 md:pb-9 mt-7 md:-mt-1.5">
              <h4 className="text-2xl font-bold 2xl:text-3xl text-heading">
                {t('text-get-in-touch')}
              </h4>
            </div>
            <ContactForm />
          </div>
        </div>
        {/* <Subscription /> */}
      </Container>
    </>
  );
}

ContactUsPage.getLayout = getLayout;
