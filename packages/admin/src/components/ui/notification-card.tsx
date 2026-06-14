import Link from '@/components/ui/link';

type NotificationCardType = {
  src?: string;
  text?: string | React.ReactNode;
  time?: string;
  href?: string;
  variant?:
    | 'neutral'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'order'
    | 'message';
  isRead?: boolean;
};

const NotificationCard: React.FC<NotificationCardType> = ({
  src,
  text,
  time,
  href,
  variant = 'neutral',
  isRead,
}) => {
  const borderClassName =
    variant === 'success'
      ? 'border-green-500'
      : variant === 'warning'
        ? 'border-amber-500'
        : variant === 'danger'
          ? 'border-red-500'
          : variant === 'info'
            ? 'border-sky-500'
            : variant === 'order'
              ? 'border-indigo-500'
              : variant === 'message'
                ? 'border-violet-500'
                : 'border-gray-300';

  const dotClassName =
    variant === 'success'
      ? 'bg-green-500'
      : variant === 'warning'
        ? 'bg-amber-500'
        : variant === 'danger'
          ? 'bg-red-500'
          : variant === 'info'
            ? 'bg-sky-500'
            : variant === 'order'
              ? 'bg-indigo-500'
              : variant === 'message'
                ? 'bg-violet-500'
                : 'bg-gray-400';

  return (
    <Link
      href={href ?? '#'}
      className={`flex items-start border-b border-border-200 border-s-4 px-4 pb-3 pt-4 transition-colors ${
        isRead
          ? 'border-s-gray-200 bg-gray-50 hover:bg-gray-100'
          : `bg-light hover:bg-gray-50 ${borderClassName}`
      }`}
    >
      <div className="me-3 mt-1 flex items-center gap-2">
        {!isRead ? <span className={`h-2 w-2 rounded-full ${dotClassName}`} /> : null}
        <img className="h-8 w-8 rounded-full object-cover" src={src} alt="" />
      </div>
      <div className="-mt-1 flex flex-col">
        <div className={isRead ? 'mb-1 text-sm text-gray-500' : 'mb-1 text-sm text-body'}>
          {text}
        </div>
        <span className={isRead ? 'text-sm text-gray-400' : 'text-sm text-muted'}>
          {time}
        </span>
      </div>
    </Link>
  );
};

NotificationCard.displayName = 'NotificationCard';

export default NotificationCard;
