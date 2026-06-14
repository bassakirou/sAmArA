import { useRouter } from 'next/router';
import Button from '@/components/ui/button';
import cn from 'classnames';
import Avatar from '@/components/common/avatar';
import { siteSettings } from '@/settings/site.settings';
import { Conversations } from '@/types';
import { useWindowSize } from '@/utils/use-window-size';
import { getAuthCredentials, isSuperAdmin } from '@/utils/auth-utils';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import { BackIcon } from '@/components/icons/back-icon';
import { RESPONSIVE_WIDTH } from '@/utils/constants';
import { useTranslation } from 'next-i18next';
import { useModalAction } from '@/components/ui/modal/modal.context';
interface Props {
  className?: string;
  conversation: Conversations;
}

const HeaderView = ({ className, conversation, ...rest }: Props) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowSize();
  const auth = getAuthCredentials();
  const { openModal } = useModalAction();
  const adminPermission = isSuperAdmin(auth);
  const shopParam =
    typeof router.query.shop === 'string' ? router.query.shop : undefined;
  const isShopContext = Boolean(shopParam);
  const isVendorMessageRoute = router.pathname.includes('shop-message');
  const routes = shopParam
    ? `/${shopParam}${Routes.shopMessage.list}`
    : adminPermission
    ? Routes.message.list
    : `${Routes?.dashboard}?tab=1`;
  const counterpartName = isShopContext
    ? conversation?.user?.name ?? 'Client'
    : conversation?.shop?.name ?? 'Discussion';
  const counterpartAvatar = isShopContext
    ? conversation?.user?.profile?.avatar?.thumbnail
    : conversation?.shop?.logo?.thumbnail;
  const isUserOnline = conversation?.user?.is_connected ?? false;
  const counterpartSubtitle = isShopContext ? (
    <>
      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
      {isUserOnline ? 'Connecté' : 'Déconnecté'}
    </>
  ) : (
    conversation?.shop?.name ?? ''
  );
  return (
    <>
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-between border-b border-solid border-b-[#E5E7EB] bg-white p-2 sm:h-20',
          width >= RESPONSIVE_WIDTH ? '' : '',
          className
        )}
        {...rest}
      >
        <div
          className={cn(
            'flex min-w-0 items-center',
            adminPermission && conversation?.shop?.slug ? 'cursor-pointer' : ''
          )}
          onClick={() =>
            adminPermission && conversation?.shop?.slug
              ? router.push(`/${conversation.shop.slug}`)
              : undefined
          }
        >
          {width <= RESPONSIVE_WIDTH ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                router.back();
              }}
              className="mr-1 inline-block p-1 pl-0 text-2xl transition-colors duration-300 hover:text-accent-hover"
            >
              <BackIcon />
            </button>
          ) : (
            ''
          )}
          <Avatar
            src={counterpartAvatar ?? siteSettings?.avatar?.placeholder}
            {...rest}
            alt={counterpartName}
          />
          <div className="ml-3 min-w-0">
            <h2 className="truncate text-sm font-semibold text-heading">
              {counterpartName}
            </h2>
            {counterpartSubtitle ? (
              <p className="truncate text-xs text-[#64748B]">
                {counterpartSubtitle}
              </p>
            ) : null}
          </div>
        </div>

        {isVendorMessageRoute ? (
          <div className="flex items-center gap-2">
            <Button
              size="small"
              className="!h-8 !px-3 text-xs"
              onClick={() =>
                openModal('CHAT_CUSTOM_ORDER_OFFER', {
                  conversationId: String(conversation.id),
                  shopId: String(conversation.shop_id),
                })
              }
            >
              {t('form:button-label-generate-special-order')}
            </Button>
          </div>
        ) : null}
        {/* {adminPermission ? (
          <PopOver
            iconStyle="vertical"
            popOverPanelClass="!w-full min-w-[10rem] max-w-full rounded bg-white py-2 px-1 text-left shadow-cardAction"
            popOverButtonClass="text-[#9CA3AF]"
          >
            <Button
              className="!h-auto w-full !justify-start px-2 !py-1 text-sm leading-6 hover:bg-gray-50 hover:text-accent"
              variant="custom"
              onClick={() => router.push(`/${shop?.slug}`)}
            >
              See Profile
            </Button>

            <Button
              className="!h-auto w-full !justify-start px-2 !py-1 text-sm leading-6 hover:bg-gray-50 hover:text-accent"
              variant="custom"
            >
              Set As Default
            </Button>

            <Button
              variant="custom"
              className="!h-auto w-full !justify-start px-2 !py-1 text-sm leading-6 text-[#F83D3D] hover:bg-gray-50 hover:text-[#d03131]"
            >
              Delete
            </Button>
          </PopOver>
        ) : (
          ''
        )} */}
      </div>
    </>
  );
};

export default HeaderView;
