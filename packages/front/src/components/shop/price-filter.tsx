import { CheckBox } from '@components/ui/checkbox';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { useSettings } from '@contexts/settings.context';
import { formatPrice } from '@lib/use-price';
import { useCurrency } from '@utils/use-currency';
const priceFilterItems = [
  {
    id: '1',
    min: 0,
    max: 50,
    slug: '0-50',
  },
  {
    id: '2',
    min: 50,
    max: 100,
    slug: '50-100',
  },
  {
    id: '3',
    min: 100,
    max: 150,
    slug: '100-150',
  },
  {
    id: '4',
    min: 150,
    max: 200,
    slug: '150-200',
  },
  {
    id: '5',
    min: 200,
    max: 300,
    slug: '200-300',
  },
  {
    id: '6',
    min: 300,
    max: 500,
    slug: '300-500',
  },
  {
    id: '7',
    min: 500,
    max: 1000,
    slug: '500-1000',
  },
  {
    id: '8',
    min: 1000,
    max: null,
    slug: '1000+',
  },
];

export const PriceFilter = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { pathname, query, locale } = router;
  const { currencyOptions } = useSettings();
  const { targetCurrency } = useCurrency();
  const selectedPrices = query?.price ? (query.price as string).split(',') : [];
  const [formState, setFormState] = React.useState<string[]>(selectedPrices);

  React.useEffect(() => {
    setFormState(selectedPrices);
  }, [query?.price]);

  const formatRangePrice = React.useCallback(
    (amount: number) =>
      formatPrice({
        amount,
        currencyCode: targetCurrency,
        locale: currencyOptions?.formation || locale || 'fr',
        fractions: targetCurrency === 'XAF' ? 0 : currencyOptions?.fractions ?? 2,
      }),
    [currencyOptions?.formation, currencyOptions?.fractions, locale, targetCurrency]
  );

  const isFrench = String(locale || 'fr').toLowerCase().startsWith('fr');
  const items = React.useMemo(
    () =>
      priceFilterItems.map((item) => {
        const minLabel = formatRangePrice(item.min);
        const maxLabel =
          typeof item.max === 'number' ? formatRangePrice(item.max) : null;
        const label =
          item.min === 0 && maxLabel
            ? isFrench
              ? `Moins de ${maxLabel}`
              : `Under ${maxLabel}`
            : maxLabel
            ? `${minLabel} ${isFrench ? 'a' : 'to'} ${maxLabel}`
            : isFrench
            ? `Plus de ${minLabel}`
            : `Over ${minLabel}`;

        return { ...item, label };
      }),
    [formatRangePrice, isFrench]
  );

  function handleItemClick(e: React.FormEvent<HTMLInputElement>): void {
    const { value } = e.currentTarget;
    const currentFormState = formState.includes(value)
      ? formState.filter((i) => i !== value)
      : [...formState, value];
    const { price, ...restQuery } = query;
    router.push(
      {
        pathname,
        query: {
          ...restQuery,
          ...(!!currentFormState.length
            ? { price: currentFormState.join(',') }
            : {}),
        },
      },
      undefined,
      { scroll: false }
    );
  }

  return (
    <div className="block border-b border-gray-300 pb-7 mb-7">
      <h3 className="text-heading text-sm md:text-base font-semibold mb-7">
        {t('text-price')}
      </h3>
      <div className="mt-2 flex flex-col space-y-4">
        {items.map((item) => (
          <CheckBox
            key={item.id}
            label={item.label}
            name={item.slug}
            checked={formState.includes(item.slug)}
            value={item.slug}
            onChange={handleItemClick}
          />
        ))}
      </div>
    </div>
  );
};
