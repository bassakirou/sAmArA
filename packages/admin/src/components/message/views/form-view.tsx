import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import cn from 'classnames';
import Button from '@/components/ui/button';
import { PlusIcon } from '@/components/icons/plus-icon';
import { SendMessageIcon } from '@/components/icons/send-message';
import { toast } from 'react-toastify';
import { useSendMessage } from '@/data/conversations';
import * as yup from 'yup';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash';
import { useModalAction } from '@/components/ui/modal/modal.context';
import { Conversations } from '@/types';

const reportVendorChatDebug = (
  hypothesisId: string,
  location: string,
  msg: string,
  data: Record<string, unknown> = {}
) => {
  fetch('http://127.0.0.1:7777/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: 'vendor-chat-scroll-lag',
      runId: 'post-fix',
      hypothesisId,
      location,
      msg,
      data,
      ts: Date.now(),
    }),
  }).catch(() => {});
};

type FormValues = {
  message: string;
};

const messageSchema = yup.object().shape({
  message: yup.string().required('error-body-required'),
});

interface Props {
  className?: string;
  conversation?: Conversations;
  onTypingChange?: (isTyping: boolean) => void;
}

const CreateMessageForm = ({
  className,
  conversation,
  onTypingChange,
  ...rest
}: Props) => {
  const sendStartedAtRef = useRef<number | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { register, handleSubmit, getValues, setFocus, reset } =
    useForm<FormValues>({
      resolver: yupResolver(messageSchema),
    });
  const messageField = register('message');

  const { t } = useTranslation();
  const router = useRouter();
  const { query } = router;
  const { mutate: createMessage, isLoading: creating } = useSendMessage();
  const { openModal } = useModalAction();
  useEffect(() => {
    const listener = (event: any) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-chat-product-picker="true"]')) {
        return;
      }
      if ((target as HTMLTextAreaElement | null)?.name !== 'message') {
        return;
      }
      if (event.key === 'Enter' && event.shiftKey) {
        return false;
      }
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault();
        const values = getValues();
        onSubmit(values);
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [getValues, query?.id]);
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onTypingChange?.(false);
    };
  }, [onTypingChange]);
  const handleTypingChange = (value: string) => {
    if (creating) {
      return;
    }

    const hasText = value.trim().length > 0;
    onTypingChange?.(hasText);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (hasText) {
      typingTimeoutRef.current = setTimeout(() => {
        onTypingChange?.(false);
      }, 1200);
    }
  };
  const onSubmit = async (values: FormValues) => {
    if (creating) {
      return;
    }
    if (isEmpty(values.message)) {
      toast?.error('Message is required');
      return;
    }
    sendStartedAtRef.current = Date.now();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTypingChange?.(false);
    // #region debug-point E:send-message-start
    reportVendorChatDebug(
      'E',
      'form-view.tsx:onSubmit:start',
      '[DEBUG] send message requested',
      {
        conversationId: query?.id,
        messageLength: values?.message?.length ?? 0,
      }
    );
    // #endregion
    createMessage(
      {
        message: values?.message,
        id: query?.id as string,
      },
      {
        onError: (error: any) => {
          // #region debug-point E:send-message-error
          reportVendorChatDebug(
            'E',
            'form-view.tsx:onSubmit:error',
            '[DEBUG] send message failed',
            {
              conversationId: query?.id,
              durationMs: sendStartedAtRef.current
                ? Date.now() - sendStartedAtRef.current
                : null,
              error: error?.message ?? 'unknown',
            }
          );
          // #endregion
          toast?.error(error?.message);
        },
        onSuccess: () => {
          const chatBody = document.getElementById('chatBody');
          // #region debug-point E:send-message-success
          reportVendorChatDebug(
            'E',
            'form-view.tsx:onSubmit:success',
            '[DEBUG] send message succeeded',
            {
              conversationId: query?.id,
              durationMs: sendStartedAtRef.current
                ? Date.now() - sendStartedAtRef.current
                : null,
              scrollTop: chatBody?.scrollTop ?? null,
              scrollHeight: chatBody?.scrollHeight ?? null,
            }
          );
          // #endregion
          chatBody?.scrollTo({
            top: chatBody?.scrollHeight,
            behavior: 'smooth',
          });
          reset();
        },
      }
    );
  };
  useEffect(() => {
    setFocus('message');
  }, [setFocus]);
  return (
    <>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div
          className={cn(
            'relative flex items-end gap-3 rounded-[24px] border border-[#D8E1EA] bg-white px-3 py-3 shadow-sm',
            className
          )}
          {...rest}
        >
          <button
            type="button"
            data-chat-product-picker="true"
            onClick={() =>
              openModal('CHAT_PRODUCT_PICKER', {
                conversationId: query?.id as string,
                shopId: conversation?.shop_id,
              })
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D8E1EA] text-accent transition hover:border-accent hover:bg-accent hover:text-white"
            aria-label="Ajouter un produit"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
          <textarea
            {...messageField}
            rows={1}
            placeholder="Ecrivez votre message..."
            className="max-h-32 min-h-[2.75rem] flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm text-heading outline-none focus:ring-0"
            onChange={(event) => {
              messageField.onChange(event);
              handleTypingChange(event.target.value);
            }}
          />
          <Button
            type="submit"
            className="!h-11 !w-11 shrink-0 rounded-full !p-0 text-lg focus:!shadow-none focus:!ring-0"
            disabled={!!creating}
            aria-label={t('common:text-send')}
          >
            <SendMessageIcon />
          </Button>
        </div>
      </form>
    </>
  );
};

export default CreateMessageForm;
