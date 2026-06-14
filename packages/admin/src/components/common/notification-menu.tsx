import { useState } from 'react';
import { useLayer } from 'react-laag';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from '@/components/icons/bell';
import { Dot } from '@/components/icons/dot';
import NotificationCard from '@/components/ui/notification-card';
import Button from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

type ItemType = {
  source?: string;
  text?: string | React.ReactNode;
  time?: string;
  href?: string;
};

interface MenuType {
  data: ItemType[];
  title?: string;
  total?: number;
  onClear?: () => void;
  seeAllHref?: string;
  seeAllLabel?: string;
}

const NotificationMenu: React.FC<MenuType> = ({
  data,
  title,
  total,
  onClear,
  seeAllHref,
  seeAllLabel,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);

  // helper function to close the menu
  function close() {
    setOpen(false);
  }

  const { renderLayer, triggerProps, layerProps } = useLayer({
    isOpen,
    onOutsideClick: close, // close the menu when the user clicks outside
    onDisappear: close, // close the menu when the menu gets scrolled out of sight
    overflowContainer: false, // keep the menu positioned inside the container
    // auto: true, // automatically find the best placement
    placement: 'bottom-end', // we prefer to place the menu "top-end"
    triggerOffset: 12, // keep some distance to the trigger
    // containerOffset: 16, // give the menu some room to breath relative to the container
    // arrowOffset: 16, // let the arrow have some room to breath also
  });

  // Again, we're using framer-motion for the transition effect
  return (
    <>
      <button
        className="relative flex items-center justify-center rounded text-heading outline-none transition duration-300 ease-in-out focus:outline-none focus:ring-1"
        aria-label="show notifications"
        {...triggerProps}
        onClick={() => setOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />

        {typeof total === 'number' ? (
          total > 0 ? (
            <span className="absolute -bottom-2 -right-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white shadow-sm">
              {total > 99 ? '99+' : total}
            </span>
          ) : null
        ) : (
          <div className="absolute -bottom-1.5 -right-1.5 flex text-red-600">
            <Dot />
          </div>
        )}
      </button>

      {renderLayer(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              {...layerProps}
              initial={{ opacity: 0, scale: 0.85 }} // animate from
              animate={{ opacity: 1, scale: 1 }} // animate to
              exit={{ opacity: 0, scale: 0.85 }} // animate exit
              transition={{
                type: 'spring',
                stiffness: 800,
                damping: 35,
              }}
              className="z-[80] w-80 overflow-hidden rounded bg-light shadow-base"
            >
              <div className="flex items-center justify-between border-b border-border-200 px-4 py-3">
                <span className="text-lg font-semibold text-heading">
                  {title ?? t('common:text-notifications')}
                </span>

                {onClear ? (
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onClear();
                    }}
                    className="text-sm font-semibold text-red-500 transition duration-200 hover:text-red-600 focus:outline-none focus:ring-1"
                  >
                    {t('common:text-clear-all')}
                  </button>
                ) : null}
              </div>
              {!!data.length ? (
                data?.map((item: ItemType, index) => (
                  <NotificationCard
                    key={index}
                    src={item.source}
                    text={item.text}
                    time={item.time}
                    href={item.href}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center border-b border-border-200 bg-light">
                  <p className="py-5 text-sm text-body">
                    {t('common:text-no-notifications')}
                  </p>
                </div>
              )}

              {seeAllHref ? (
                <div className="border-t border-border-200 bg-light px-4 py-3">
                  <Button
                    size="small"
                    variant="outline"
                    className="w-full border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    onClick={() => {
                      close();
                      router.push(seeAllHref);
                    }}
                  >
                  {seeAllLabel ?? t('common:text-see-all')}
                  </Button>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

export default NotificationMenu;
