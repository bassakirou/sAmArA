import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import cn from 'classnames';
import Link from '@components/ui/link';
import Image from 'next/image';
import usePrice from '@lib/use-price';
import { ROUTES } from '@lib/routes';
import { Message, Product } from '@type/index';
import {
  getProductImageSrc,
  getShopLogoSrc,
  PRODUCT_PLACEHOLDER,
} from './chat-media';
import ProductMessageCard from './product-message-card';
import CustomOrderOfferCard from './custom-order-offer-card';

dayjs.locale('fr');

type PendingMessage = {
  id: string;
  body: string;
  created_at: string;
  product?: Product | null;
};

const PendingBubble = ({ message }: { message: PendingMessage }) => {
  return (
    <div className="flex flex-col max-w-[85%] self-end items-end">
      <div className="overflow-hidden rounded-2xl rounded-tr-none bg-olive text-white shadow-sm opacity-95">
        {message.product ? (
          <div className="px-3 pt-3">
            <ProductMessageCard product={message.product} isMine />
          </div>
        ) : null}
        <div className={cn(message.product ? 'px-4 pb-3 pt-3' : 'px-4 py-3')}>
          <div className="h-3 w-16 rounded-full bg-white/20 animate-pulse mb-2" />
          <div className="text-sm leading-relaxed text-white/95">
            {message.body}
          </div>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 mt-1 px-1">Envoi…</span>
    </div>
  );
};

const TypingIndicator = ({ name }: { name: string }) => {
  return (
    <div className="flex flex-col max-w-[85%] self-start items-start">
      <span className="mb-2 px-1 text-[11px] font-medium text-gray-500">
        {name} est en train d'écrire…
      </span>
      <div className="rounded-2xl rounded-tl-none bg-black px-4 py-3 text-white shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.2s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.1s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
};

const MessageList = ({
  messages,
  meId,
  pendingMessages = [],
  typingName,
  activeShop,
}: {
  messages: Message[];
  meId?: string | number;
  pendingMessages?: PendingMessage[];
  typingName?: string | null;
  activeShop?: any;
}) => {
  return (
    <div className="flex flex-col gap-6">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-gray-400">Aucun message pour le moment.</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isMine = meId != null && String(msg.user_id) === String(meId);
          const vendorLogo = getShopLogoSrc(msg?.product?.shop ?? msg?.user?.shop ?? activeShop);
          return (
            <div
              key={msg.id}
              className={cn(
                'flex flex-col max-w-[85%]',
                isMine ? 'self-end items-end' : 'self-start items-start'
              )}
            >
              <div className="flex items-end gap-3">
                {!isMine ? (
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-linen">
                    <Image
                      src={vendorLogo || PRODUCT_PLACEHOLDER}
                      alt={activeShop?.name ?? msg?.product?.shop?.name ?? 'Boutique'}
                      fill
                      sizes="36px"
                      className="object-cover"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.srcset = PRODUCT_PLACEHOLDER;
                      }}
                    />
                  </div>
                ) : null}
                <div
                  className={cn(
                    'overflow-hidden rounded-2xl text-sm leading-relaxed shadow-sm',
                    isMine
                      ? 'bg-olive text-white rounded-tr-none'
                      : 'bg-black text-white rounded-tl-none border border-black'
                  )}
                >
                {msg.custom_offer ? (
                  <div className="px-3 pt-3">
                    <CustomOrderOfferCard offer={msg.custom_offer} isMine={isMine} />
                  </div>
                ) : msg.product ? (
                  <div className="px-3 pt-3">
                    <ProductMessageCard product={msg.product} isMine={isMine} />
                  </div>
                ) : null}
                {msg.body ? (
                  <div
                    className={cn(msg.product ? 'px-4 pb-3 pt-3' : 'px-4 py-3')}
                  >
                    {msg.body}
                  </div>
                ) : null}
                </div>
              </div>
              <span className="text-[10px] text-gray-400 mt-1 px-1">
                {dayjs(msg.created_at).format('HH:mm')}
              </span>
            </div>
          );
        })
      )}
      {pendingMessages.map((message) => (
        <PendingBubble key={message.id} message={message} />
      ))}
      {typingName ? <TypingIndicator name={typingName} /> : null}
    </div>
  );
};

export default MessageList;
