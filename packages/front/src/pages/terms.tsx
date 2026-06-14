import { getLayout } from "@components/layout/layout";
import Container from "@components/ui/container";
import PageHeader from "@components/ui/page-header";
import { Link, Element } from "react-scroll";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { QueryClient } from "react-query";
import { API_ENDPOINTS } from "@framework/utils/endpoints";
import client from '@framework/utils/index'

const sanitizeRichTextHtml = (input: string) => {
  let html = String(input ?? "");

  html = html.replace(/\u0000/g, "");
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(
    /<\s*(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    ""
  );
  html = html.replace(
    /<\s*(script|style|iframe|object|embed|link|meta)[^>]*\/\s*>/gi,
    ""
  );

  html = html.replace(/<\s*a\b([^>]*)>/gi, (_match, attrs) => {
    const hrefMatch = String(attrs ?? "").match(
      /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i
    );
    const hrefRaw = hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "";
    const href = hrefRaw.trim();
    const isSafe = !href || /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href);

    if (!isSafe) {
      return "<a>";
    }

    const safeHref = href
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return safeHref
      ? `<a href="${safeHref}" target="_blank" rel="nofollow noopener noreferrer">`
      : "<a>";
  });

  html = html.replace(
    /<\s*(\/?)\s*([a-z0-9]+)(\s[^>]*)?>/gi,
    (_m, slash, tag) => {
      const normalizedTag = String(tag ?? "").toLowerCase();
      return `<${slash}${normalizedTag}>`;
    }
  );

  return html;
};

function makeTitleToDOMId(title: string) {
  return title.toLowerCase().split(" ").join("_");
}

type TermsItem = { id: string | number; title: string; description: string };

export default function TermsPage({ termsAndServices }: { termsAndServices: TermsItem[] }) {
  return (
    <>
      <PageHeader pageHeader="text-page-terms-of-service" />
      <div className="mt-12 lg:mt-14 xl:mt-16 lg:py-1 xl:py-0 border-b border-gray-300 px-4 md:px-10 lg:px-7 xl:px-16 2xl:px-24 3xl:px-32 pb-9 md:pb-14 lg:pb-16 2xl:pb-20 3xl:pb-24">
        <Container>
          <div className="flex flex-col md:flex-row">
            <nav className="md:w-72 xl:w-3/12 mb-8 md:mb-0">
              <ol className="sticky md:top-16 lg:top-28 z-10">
                {termsAndServices?.map((item, index) => (
                  <li key={item.id}>
                    <Link
                      spy={true}
                      offset={-120}
                      smooth={true}
                      duration={500}
                      to={makeTitleToDOMId(item.title)}
                      activeClass="text-heading font-semibold"
                      className="block cursor-pointer py-3 lg:py-3.5 text-sm lg:text-base  text-gray-700 uppercase"
                    >
                      {(index <= 9 ? "0" : "") +
                        index +
                        " " +
                        item.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
            {/* End of section scroll spy menu */}

            <div className="md:w-9/12 ltr:md:pl-8 rtl:md:pr-8">
              {termsAndServices?.map((item) => (
                // @ts-ignore
                <Element
                  key={item.title}
                  id={makeTitleToDOMId(item.title)}
                  className="mb-10"
                >
                  <h2 className="text-lg md:text-xl lg:text-2xl text-heading font-bold mb-4">
                    {item.title}
                  </h2>
                  <div
                    className="richText"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeRichTextHtml(item.description),
                    }}
                  />
                </Element>
              ))}
            </div>
            {/* End of content */}
          </div>
        </Container>
      </div>
    </>
  );
}

TermsPage.getLayout = getLayout;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(API_ENDPOINTS.SETTINGS, () => client.settings.findAll());
  const termsResponse = await client.termsAndConditions.all({
    language: locale!,
    limit: 200,
  } as any);

  return {
    props: {
      termsAndServices: (termsResponse?.data ?? []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
      })) as TermsItem[],
      ...(await serverSideTranslations(locale!, [
        "common",
        "menu",
        "forms",
        "footer",
      ])),
    },
  };
};
