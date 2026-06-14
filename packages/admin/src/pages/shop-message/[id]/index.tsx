import Layout from '@/components/layouts/owner';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import MessagePageIndex from '@/components/message/index';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useMyShopsQuery } from '@/data/shop';
import { useConversationQuery } from '@/data/conversations';
import { resolveConversationHref } from '@/components/message/chat-route';

export default function MessagePage() {
  const router = useRouter();
  const conversationId =
    typeof router.query.id === 'string' ? router.query.id : undefined;
  const { data: conversation } = useConversationQuery({
    id: conversationId ?? '',
  });
  const { data: myShops = [] } = useMyShopsQuery({
    enabled: Boolean(conversationId),
  });

  useEffect(() => {
    if (!conversationId) return;
    if (!conversation?.shop_id) return;

    const targetHref = resolveConversationHref({
      conversationId,
      noticeShopId: conversation.shop_id,
      ownedShops: myShops,
      fallbackToOwnerView: true,
    });

    if (targetHref && targetHref !== router.asPath) {
      router.replace(targetHref);
    }
  }, [conversation?.shop_id, conversationId, myShops, router]);

  return (
    <>
      <MessagePageIndex />
    </>
  );
}

MessagePage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};

MessagePage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
