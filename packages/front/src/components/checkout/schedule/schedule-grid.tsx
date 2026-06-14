import { RadioGroup } from "@headlessui/react";
import { useAtom } from "jotai";
import ScheduleCard from "./schedule-card";
import { deliveryTimeAtom } from "@store/checkout";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useSettings } from "@contexts/settings.context";
import { useCart } from "@store/quick-cart/cart.context";
import { useShop } from "@framework/shops";

interface ScheduleProps {
  label: string;
  className?: string;
  count?: number;
}

export const ScheduleGrid: React.FC<ScheduleProps> = ({
  label,
  className,
  count,
}) => {
  const { t } = useTranslation("common");
  const { deliveryTime: globalSchedules } = useSettings();
  const { items } = useCart();
  const shopSlug =
    (items?.find((i: any) => Boolean(i?.shop_slug)) as any)?.shop_slug ?? null;
  const { data: shop } = useShop(shopSlug ?? undefined);
  const schedules =
    shop?.settings?.deliveryTime && shop.settings.deliveryTime.length
      ? shop.settings.deliveryTime
      : globalSchedules;

  const [selectedSchedule, setSchedule] = useAtom(deliveryTimeAtom);
  useEffect(() => {
    if (!schedules?.length) return;
    if (selectedSchedule) return;
    setSchedule(schedules[0]);
  }, [schedules, selectedSchedule, setSchedule]);
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-5 lg:mb-6 xl:mb-7 -mt-1 xl:-mt-2">
        <div className="flex items-center space-x-3 md:space-x-4 rtl:space-x-reverse text-lg lg:text-xl xl:text-2xl text-heading capitalize font-bold">
          {count && (
            <span className="flex items-center justify-center ltr:mr-2 rtl:ml-2">
              {count}.
            </span>
          )}
          {label}
        </div>
      </div>

      {schedules && schedules?.length ? (
        <RadioGroup value={selectedSchedule} onChange={setSchedule}>
          <RadioGroup.Label className="sr-only">{label}</RadioGroup.Label>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {schedules?.map((schedule: any, idx: number) => (
              <RadioGroup.Option
                value={schedule}
                key={idx}
                className="focus-visible:outline-none"
              >
                {({ checked }) => (
                  <ScheduleCard checked={checked} schedule={schedule} />
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      ) : (
        <></>
      )}
    </div>
  );
};
export default ScheduleGrid;
