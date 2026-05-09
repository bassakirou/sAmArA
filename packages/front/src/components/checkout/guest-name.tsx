import React from 'react';
import { guestNameAtom } from '@store/checkout';
import { useAtom } from 'jotai';
import Input from '@components/ui/input';

interface GuestNameProps {
  count: number;
  label: string;
  className: string;
}

function GuestName({ count, label, className }: GuestNameProps) {
  const [name, setName] = useAtom(guestNameAtom);
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
      <div className="block">
        <Input
          //@ts-ignore

          value={name}
          name="guestName"
          onChange={(e) => setName(e.target.value)}
          variant="outline"
        />
      </div>
    </div>
  );
}
export default GuestName;
