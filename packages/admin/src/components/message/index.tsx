import UserListIndex from '@/components/message/user-list-index';
import UserMessageIndex from '@/components/message/user-message-index';
import { useWindowSize } from '@/utils/use-window-size';
import ResponsiveView from '@/components/message/views/responsive-vew';
import { RESPONSIVE_WIDTH } from '@/utils/constants';

export default function MessagePageIndex() {
  const { width } = useWindowSize();
  return (
    <div
      className="overflow-hidden bg-white md:rounded-2xl md:border md:border-[#E5E7EB]"
      style={{
        height:
          width >= RESPONSIVE_WIDTH
            ? 'calc(100dvh - 11rem)'
            : 'calc(100dvh - 5rem)',
      }}
    >
      {width >= RESPONSIVE_WIDTH ? (
        <div className="flex h-full min-h-0 flex-wrap overflow-hidden">
          <UserListIndex />
          <UserMessageIndex />
        </div>
      ) : (
        <ResponsiveView />
      )}
    </div>
  );
}
