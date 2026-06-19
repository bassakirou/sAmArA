import { Fragment, useMemo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { HiOutlineSelector } from 'react-icons/hi';
import { useCurrency } from '@utils/use-currency';
import { CURRENCY } from '@components/settings/currency';

const compactCurrencyLabel: Record<string, string> = {
  XAF: 'F CFA',
  EUR: '€',
  USD: '$',
};

export default function CurrencySwitcher() {
  const { targetCurrency, setTargetCurrency } = useCurrency();

  const selectedCurrency = useMemo(() => {
    return (
      CURRENCY.find((currency) => currency.code === targetCurrency) ??
      CURRENCY[0]
    );
  }, [targetCurrency]);

  return (
    <Listbox value={selectedCurrency.code} onChange={setTargetCurrency}>
      {({ open }) => (
        <div className="relative z-10 ms-2">
          <Listbox.Button className="relative flex h-10 w-full cursor-pointer items-center rounded-md border border-[#CFD3DA] bg-white py-2 text-sm font-semibold text-heading ltr:pl-3 ltr:pr-8 rtl:pr-3 rtl:pl-8 focus:outline-0">
            <span className="truncate">
              {compactCurrencyLabel[selectedCurrency.code] ??
                selectedCurrency.code}
            </span>
            <span className="pointer-events-none absolute inset-y-0 flex items-center ltr:right-0 ltr:pr-2 rtl:left-0 rtl:pl-2">
              <HiOutlineSelector
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-[130px] overflow-auto rounded-md border border-[#CFD3DA] bg-white py-1 text-sm shadow-lg focus:outline-0 ltr:right-0 rtl:left-0">
              {CURRENCY.map((currency) => (
                <Listbox.Option
                  key={currency.code}
                  className={({ active }) =>
                    `${
                      active ? 'bg-gray-100 text-heading' : 'text-gray-900'
                    } relative cursor-pointer select-none px-3 py-2`
                  }
                  value={currency.code}
                >
                  {({ selected }) => (
                    <span className="flex items-center justify-between gap-3">
                      <span
                        className={selected ? 'font-semibold' : 'font-normal'}
                      >
                        {currency.name}
                      </span>
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}
