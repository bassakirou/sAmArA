import { useEffect, useRef, useState } from 'react';
import { IoSend } from 'react-icons/io5';

const MessageInput = ({
  onSend,
  isSending,
  disabled,
  onTypingChange,
}: {
  onSend: (body: string) => void;
  isSending?: boolean;
  disabled?: boolean;
  onTypingChange?: (isTyping: boolean) => void;
}) => {
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onTypingChange?.(false);
    };
  }, [onTypingChange]);

  const handleSend = () => {
    if (!message.trim()) return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTypingChange?.(false);
    onSend(message.trim());
    setMessage('');
  };

  const isDisabled = disabled || isSending || !message.trim();

  return (
    <div className="relative flex items-center">
      <textarea
        value={message}
        onChange={(e) => {
          const nextValue = e.target.value;
          setMessage(nextValue);

          if (disabled || isSending) {
            return;
          }

          const hasText = nextValue.trim().length > 0;
          onTypingChange?.(hasText);

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          if (hasText) {
            typingTimeoutRef.current = setTimeout(() => {
              onTypingChange?.(false);
            }, 1200);
          }
        }}
        placeholder="Écrivez votre message au vendeur..."
        rows={1}
        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 pr-14 text-sm resize-none focus:ring-0 placeholder:text-gray-400 disabled:opacity-60"
        disabled={disabled || isSending}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <button 
        onClick={handleSend}
        disabled={isDisabled}
        className="absolute right-2 p-2 bg-olive text-white rounded-full disabled:bg-gray-200 transition-colors"
      >
        <IoSend size={18} />
      </button>
    </div>
  );
};

export default MessageInput;
