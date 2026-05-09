import TextArea from '@components/ui/text-area';
import { orderNoteAtom } from '@store/checkout';
import { useAtom } from 'jotai';

interface OrderNoteProps {
  count: number;
  label: string;
  className: string;
}

function OrderNote({ count, label, className }: OrderNoteProps) {
  const [note, setNote] = useAtom(orderNoteAtom);

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
        <TextArea
          //@ts-ignore
          value={note}
          name="orderNote"
          onChange={(e) => setNote(e.target.value)}
          variant="outline"
        />
      </div>
    </div>
  );
}

export default OrderNote;
