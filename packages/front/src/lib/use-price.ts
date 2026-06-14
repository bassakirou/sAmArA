import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSettings } from '@contexts/settings.context';
import { useCurrency } from '@utils/use-currency';
import { CURRENCY } from '@components/settings/currency';

function normalizeCurrencyDisplay(value: string, currencyCode: string) {
  if (currencyCode !== 'XAF') return value;
  return value.replace(/\b(XAF|FCFA)\b/g, 'F CFA');
}

function getCurrencyFractionDigits(currencyCode: string, fallback: number) {
  const matchedCurrency = CURRENCY.find((item) => item.code === currencyCode);

  if (!matchedCurrency) return fallback;

  const digits = Number(matchedCurrency.decimal_digits);
  if (!Number.isFinite(digits)) return fallback;

  return digits;
}

export function formatPrice({
  amount,
  currencyCode,
  locale,
  fractions,
}: {
  amount: number;
  currencyCode: string;
  locale: string;
  fractions: number;
}) {
  const formatCurrency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: fractions,
  });

  return normalizeCurrencyDisplay(formatCurrency.format(amount), currencyCode);
}

export function formatVariantPrice({
  amount,
  baseAmount,
  currencyCode,
  locale,
  fractions = 2,
}: {
  baseAmount: number;
  amount: number;
  currencyCode: string;
  locale: string;
  fractions: number;
}) {
  const hasDiscount = baseAmount > amount;
  const formatDiscount = new Intl.NumberFormat(locale, { style: 'percent' });
  const discount = hasDiscount
    ? formatDiscount.format((baseAmount - amount) / baseAmount)
    : null;

  const price = formatPrice({ amount, currencyCode, locale, fractions });
  const basePrice = hasDiscount
    ? formatPrice({ amount: baseAmount, currencyCode, locale, fractions })
    : null;

  return { price, basePrice, discount };
}

export default function usePrice(
  data?: {
    amount: number;
    baseAmount?: number;
    currencyCode?: string;
  } | null
) {
  const { currencyOptions } = useSettings();
  const { amount, baseAmount, currencyCode } = data ?? {};
  const { formation = 'en-US', fractions = 2 } = currencyOptions!;
  const { locale } = useRouter();

  const { convert, targetCurrency, baseCurrency } = useCurrency();

  const value = useMemo(() => {
    if (typeof amount !== 'number') return '';

    const sourceCurrency = currencyCode ?? baseCurrency;
    const convertedAmount = convert(amount, sourceCurrency, targetCurrency);
    const convertedBaseAmount =
      typeof baseAmount === 'number'
        ? convert(baseAmount, sourceCurrency, targetCurrency)
        : undefined;

    const currentLocale = formation ? formation : 'en';
    const configuredFractions =
      typeof fractions === 'number' && Number.isFinite(fractions)
        ? fractions
        : 2;
    const currencyFractionDigits = getCurrencyFractionDigits(
      targetCurrency,
      configuredFractions
    );
    const effectiveFractions =
      targetCurrency === 'XAF'
        ? 0
        : Math.max(currencyFractionDigits, configuredFractions);

    return convertedBaseAmount
      ? formatVariantPrice({
          amount: convertedAmount,
          baseAmount: convertedBaseAmount,
          currencyCode: targetCurrency,
          locale: currentLocale,
          fractions: effectiveFractions,
        })
      : formatPrice({
          amount: convertedAmount,
          currencyCode: targetCurrency,
          locale: currentLocale,
          fractions: effectiveFractions,
        });
  }, [
    amount,
    baseAmount,
    currencyCode,
    locale,
    convert,
    targetCurrency,
    baseCurrency,
    formation,
    fractions,
  ]);

  return typeof value === 'string'
    ? { price: value, basePrice: null, discount: null }
    : value;
}
