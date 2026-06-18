import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoChatbubblesOutline,
  IoClose,
  IoExpandOutline,
  IoContractOutline,
} from 'react-icons/io5';
import ChatWindow from './chat-window';
import cn from 'classnames';
import { chatAtom } from '@store/chat-atom';
import { authorizationAtom } from '@store/authorization-atom';
import { useUI } from '@contexts/ui.context';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import client from '@framework/utils/index';
import { useWindowSize } from '@utils/use-window-size';

type ChatWidgetProps = {
  showLauncher?: boolean;
};

const ChatWidget = ({ showLauncher = true }: ChatWidgetProps) => {
  const [chatState, setChatState] = useAtom(chatAtom);
  const [isAuthorized] = useAtom(authorizationAtom);
  const { isOpen, isExpanded } = chatState;
  const { openModal, setModalView } = useUI();
  const router = useRouter();
  const { width } = useWindowSize();
  const productSlug =
    router.pathname === '/products/[slug]'
      ? (router.query.slug as string | undefined)
      : undefined;

  const chatIntentKey = 'samara:chat:intent';
  const chatPageProductKey = 'samara:chat:page-product';

  const { data: productFromPage } = useQuery(
    ['chat_widget_product', productSlug, router.locale],
    () =>
      client.product.findOne({
        slug: productSlug as string,
        language: router.locale,
      }),
    { enabled: !!productSlug }
  );

  const productCanDiscussPrice =
    router.pathname !== '/products/[slug]'
      ? true
      : Boolean((productFromPage as any)?.can_discuss_price) ||
        Boolean((productFromPage as any)?.is_negotiable);

  const effectiveShowLauncher = showLauncher && productCanDiscussPrice;
  const isMobileViewport = width < 768;
  const shouldUseFullscreen = isMobileViewport || isExpanded;

  const setIsOpen = (val: boolean) =>
    setChatState((prev) => ({ ...prev, isOpen: val }));
  const setIsExpanded = (val: boolean) =>
    setChatState((prev) => ({ ...prev, isExpanded: val }));

  useEffect(() => {
    if (!isAuthorized && isOpen) {
      setIsOpen(false);
    }
  }, [isAuthorized, isOpen]);

  useEffect(() => {
    if (!isOpen || !isMobileViewport) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileViewport, isOpen]);

  useEffect(() => {
    if (!isAuthorized) return;
    if (typeof window === 'undefined') return;

    const raw = window.sessionStorage.getItem(chatIntentKey);
    if (!raw) return;

    try {
      const intent = JSON.parse(raw) as {
        returnTo?: string;
        isExpanded?: boolean;
        activeShopId?: number | string | null;
        activeProduct?: any | null;
      };

      if (intent.returnTo && router.asPath !== intent.returnTo) {
        router.replace(intent.returnTo);
        return;
      }

      window.sessionStorage.removeItem(chatIntentKey);
      setChatState((prev) => ({
        ...prev,
        isOpen: true,
        isExpanded: Boolean(intent.isExpanded),
        activeProduct: intent.activeProduct ?? prev.activeProduct ?? null,
        activeConversationId: null,
        activeShopId: intent.activeShopId ?? prev.activeShopId ?? null,
      }));
    } catch {
      window.sessionStorage.removeItem(chatIntentKey);
    }
  }, [isAuthorized, router.asPath, setChatState]);

  const requireAuthAndOpenChat = () => {
    if (typeof window !== 'undefined') {
      if (
        router.pathname === '/products/[slug]' &&
        typeof router.query.slug === 'string'
      ) {
        window.sessionStorage.setItem(
          chatPageProductKey,
          JSON.stringify({ slug: router.query.slug })
        );
      } else {
        window.sessionStorage.removeItem(chatPageProductKey);
      }
    }

    if (isAuthorized) {
      setIsOpen(true);
      return;
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        chatIntentKey,
        JSON.stringify({ returnTo: router.asPath, isExpanded: false })
      );
    }

    setModalView('LOGIN_VIEW');
    openModal();
    toast.error(
      <div>
        <div className="font-semibold">Unauthenticated</div>
        <div>Vous devez être connecté pour discuter.</div>
      </div>,
      { toastId: 'chat-auth' }
    );
  };

  if (!isOpen && !effectiveShowLauncher) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              shouldUseFullscreen
                ? isMobileViewport
                  ? 'fixed inset-x-0 bottom-0 top-16 z-50'
                  : 'fixed inset-0 z-50 flex items-center justify-center p-4'
                : 'flex flex-col items-end'
            )}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                width: shouldUseFullscreen
                  ? isMobileViewport
                    ? '100vw'
                    : 'min(1000px, calc(100vw - 2rem))'
                  : '400px',
                height: shouldUseFullscreen
                  ? isMobileViewport
                    ? 'calc(100dvh - 4rem)'
                    : 'min(720px, calc(100vh - 2rem))'
                  : '600px',
              }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className={cn(
                'bg-white border border-gray-100 flex flex-col overflow-hidden transition-all duration-300',
                shouldUseFullscreen
                  ? isMobileViewport
                    ? 'h-full w-full rounded-none border-x-0 border-b-0 shadow-none'
                    : 'rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.25)]'
                  : 'mb-4 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.25)]'
              )}
            >
              <div className="p-4 border-b flex justify-between items-start border-gray-500">
                <div>
                  <h3 className="font-bold text-lg text-heading">
                    Négociation & chat vendeur
                  </h3>
                  <p className="text-sm text-body">
                    Discutez des prix, posez vos questions et recevez des offres
                    privées.
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isMobileViewport ? (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {isExpanded ? (
                        <IoContractOutline size={20} />
                      ) : (
                        <IoExpandOutline size={20} />
                      )}
                    </button>
                  ) : null}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <IoClose size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-hidden flex flex-col">
                <ChatWindow isExpanded={isExpanded} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      {effectiveShowLauncher && !isOpen && (
        <button
          onClick={requireAuthAndOpenChat}
          className="bg-black text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-800 transition-all transform hover:scale-105"
        >
          <IoChatbubblesOutline size={20} />
          <span className="font-semibold text-sm uppercase tracking-wider">
            Discuter le prix
          </span>
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
