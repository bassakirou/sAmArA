import { useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { displayCurrencyAtom, DisplayCurrency } from '@store/currency';

type ExchangeRates = Record<string, number>;
type FxCache = { storedAt: number; rates: ExchangeRates };

const baseCurrency: DisplayCurrency = 'XAF';
const API_URL = `https://open.er-api.com/v6/latest/${baseCurrency}`;
const CACHE_KEY = 'sAmArA-fxrates.latest.XAF';
const TTL_MS = 6 * 60 * 60 * 1000;

function readCache(): FxCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FxCache;
    if (!parsed?.storedAt || !parsed?.rates) return null;
    if (Date.now() - parsed.storedAt > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(cache: FxCache) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    return;
  }
}

function isDisplayCurrency(value: string): value is DisplayCurrency {
  return value === 'XAF' || value === 'USD' || value === 'EUR';
}

export function useCurrency() {
  const [targetCurrency, setTargetCurrency] = useAtom(displayCurrencyAtom);
  const [rates, setRates] = useState<ExchangeRates | null>(null);

  useEffect(() => {
    const cached = readCache();
    if (cached?.rates) setRates(cached.rates);

    let cancelled = false;

    async function fetchRates() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (cancelled) return;
        if (data?.result === 'success' && data?.rates) {
          setRates(data.rates as ExchangeRates);
          writeCache({ storedAt: Date.now(), rates: data.rates as ExchangeRates });
        }
      } catch {
        return;
      }
    }

    fetchRates();

    return () => {
      cancelled = true;
    };
  }, []);

  const safeSetTargetCurrency = useMemo(() => {
    return (next: string) => {
      if (!isDisplayCurrency(next)) return;
      setTargetCurrency(next);
    };
  }, [setTargetCurrency]);

  const convert = useMemo(() => {
    return (
      amount: number,
      fromCurrency: string = baseCurrency,
      toCurrency: string = targetCurrency
    ) => {
      if (typeof amount !== 'number' || Number.isNaN(amount)) return amount;
      if (!rates) return amount;
      if (fromCurrency === toCurrency) return amount;

      const fromRate = rates[fromCurrency];
      const toRate = rates[toCurrency];

      if (!fromRate || !toRate) return amount;

      if (fromCurrency === baseCurrency) return amount * toRate;
      if (toCurrency === baseCurrency) return amount / fromRate;
      return (amount / fromRate) * toRate;
    };
  }, [rates, targetCurrency]);

  return {
    baseCurrency,
    rates,
    targetCurrency,
    setTargetCurrency: safeSetTargetCurrency,
    convert,
  };
}
