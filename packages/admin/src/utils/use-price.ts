import { useMemo } from 'react';
import { siteSettings } from '@/settings/site.settings';
import { useSettings } from '@/contexts/settings.context';
import { useCurrency } from './use-currency';

function normalizeCurrencyDisplay(formatted: string, currencyCode: string) {
  if (currencyCode === 'XAF') {
    return formatted.replace(/FCFA/g, 'F CFA').replace(/XAF/g, 'F CFA');
  }
  return formatted;
}

export function formatPrice({
  amount,
  currencyCode,
  locale,
  fractions = 2,
}: {
  amount: number;
  currencyCode: string;
  locale: string;
  fractions: number;
}) {
  const formatCurrency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits:
      typeof fractions === 'number' &&
      !isNaN(fractions) &&
      fractions >= 0 &&
      fractions <= 20
        ? fractions
        : 2,
    maximumFractionDigits:
      typeof fractions === 'number' &&
      !isNaN(fractions) &&
      fractions >= 0 &&
      fractions <= 20
        ? fractions
        : 2,
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
  const hasDiscount = baseAmount < amount;
  const formatDiscount = new Intl.NumberFormat(locale, { style: 'percent' });
  const discount = hasDiscount
    ? formatDiscount.format((amount - baseAmount) / amount)
    : null;

  const price = formatPrice({ amount, currencyCode, locale, fractions });
  const basePrice = hasDiscount
    ? formatPrice({ amount: baseAmount, currencyCode, locale, fractions })
    : null;

  return { price, basePrice, discount };
}

type PriceProps = {
  amount: number;
  baseAmount?: number;
  currencyCode?: string;
};

export default function usePrice(data?: PriceProps | null) {
  const { currencyOptions } = useSettings();
  const { formation, fractions } = currencyOptions;
  const { amount, baseAmount, currencyCode } = data ?? {};

  const { convert, targetCurrency, baseCurrency, rates } = useCurrency();
  const sourceCurrency = currencyCode ?? baseCurrency;
  const effectiveTargetCurrency = rates ? targetCurrency : baseCurrency;

  const locale = formation ?? siteSettings.defaultLanguage;

  const value = useMemo(() => {
    if (typeof amount !== 'number' || !sourceCurrency) return '';

    const convertedAmount = convert(
      amount,
      sourceCurrency,
      effectiveTargetCurrency
    );
    const convertedBaseAmount =
      typeof baseAmount === 'number'
        ? convert(baseAmount, sourceCurrency, effectiveTargetCurrency)
        : undefined;

    return convertedBaseAmount
      ? formatVariantPrice({
          amount: convertedAmount,
          baseAmount: convertedBaseAmount,
          currencyCode: effectiveTargetCurrency,
          locale,
          fractions,
        })
      : formatPrice({
          amount: convertedAmount,
          currencyCode: effectiveTargetCurrency,
          locale,
          fractions,
        });
  }, [
    amount,
    baseAmount,
    sourceCurrency,
    convert,
    targetCurrency,
    effectiveTargetCurrency,
    baseCurrency,
    rates,
    locale,
    fractions,
  ]);

  return typeof value === 'string'
    ? { price: value, basePrice: null, discount: null }
    : value;
}
